from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.models import User, Session, ChallengeResult, CalibrationResult
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"], dependencies=[Depends(get_current_user)])


@router.get("/student/{user_id}")
async def get_student_analytics(user_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sessions_result = await db.execute(
        select(Session).where(Session.user_id == user_id).order_by(Session.started_at.desc())
    )
    sessions = sessions_result.scalars().all()

    challenges_result = await db.execute(
        select(func.count(ChallengeResult.id), func.avg(ChallengeResult.score))
        .join(Session, ChallengeResult.session_id == Session.id)
        .where(Session.user_id == user_id)
    )
    total_challenges, avg_score = challenges_result.one()

    cal_result = await db.execute(
        select(func.avg(CalibrationResult.calibration_index))
        .join(Session, CalibrationResult.session_id == Session.id)
        .where(Session.user_id == user_id)
    )
    avg_calibration = cal_result.scalar()

    cluster_result = await db.execute(
        select(CalibrationResult.cluster, func.count(CalibrationResult.id).label("cnt"))
        .join(Session, CalibrationResult.session_id == Session.id)
        .where(Session.user_id == user_id)
        .group_by(CalibrationResult.cluster)
        .order_by(func.count(CalibrationResult.id).desc())
        .limit(1)
    )
    dominant_cluster_row = cluster_result.one_or_none()

    return {
        "user": {"id": str(user.id), "name": user.name, "last_name": user.last_name, "email": user.email, "role": user.role, "created_at": user.created_at.isoformat()},
        "sessions_count": len(sessions),
        "total_challenges_completed": total_challenges or 0,
        "average_score": float(avg_score) if avg_score else None,
        "average_calibration": float(avg_calibration) if avg_calibration else None,
        "dominant_cluster": dominant_cluster_row[0] if dominant_cluster_row else None,
        "recent_sessions": [
            {
                "id": s.id, "status": s.status, "current_level": s.current_level,
                "total_time_seconds": s.total_time_seconds,
                "final_score": float(s.final_score) if s.final_score else None,
                "started_at": s.started_at.isoformat(),
                "completed_at": s.completed_at.isoformat() if s.completed_at else None,
            }
            for s in sessions[:10]
        ],
    }


@router.get("/class")
async def get_class_analytics(db: AsyncSession = Depends(get_db)):
    students = await db.execute(
        select(User).where(User.role == "student").order_by(User.name)
    )
    students_list = students.scalars().all()
    student_ids = [s.id for s in students_list]

    if not student_ids:
        return _empty_class_response()

    # Batch 1: latest calibration per student
    latest_cal_subq = (
        select(
            CalibrationResult.session_id,
            CalibrationResult.id.label("cal_id"),
            func.row_number().over(
                order_by=CalibrationResult.created_at.desc(),
                partition_by=Session.user_id,
            ).label("rn"),
        )
        .join(Session, CalibrationResult.session_id == Session.id)
        .where(Session.user_id.in_(student_ids))
        .subquery()
    )
    cal_rows = await db.execute(
        select(CalibrationResult, Session.user_id)
        .join(latest_cal_subq, CalibrationResult.id == latest_cal_subq.c.cal_id)
        .join(Session, CalibrationResult.session_id == Session.id)
        .where(latest_cal_subq.c.rn == 1)
    )
    cal_by_user: dict[UUID, CalibrationResult] = {}
    for cal_row in cal_rows.all():
        cal, uid = cal_row
        cal_by_user[uid] = cal

    # Batch 2: latest session per student
    latest_sesh_subq = (
        select(
            Session.id,
            Session.user_id,
            func.row_number().over(
                order_by=Session.started_at.desc(),
                partition_by=Session.user_id,
            ).label("rn"),
        )
        .where(Session.user_id.in_(student_ids))
        .subquery()
    )
    sesh_rows = await db.execute(
        select(Session)
        .join(latest_sesh_subq, Session.id == latest_sesh_subq.c.id)
        .where(latest_sesh_subq.c.rn == 1)
    )
    sesh_by_user: dict[UUID, Session] = {}
    for s in sesh_rows.scalars().all():
        sesh_by_user[s.user_id] = s

    cluster_counts: dict[str, int] = {"over": 0, "sub": 0, "cal": 0}
    cluster_students: dict[str, list[dict]] = {"over": [], "sub": [], "cal": []}
    total_jol = 0.0
    total_gap = 0.0
    calibrated_count = 0
    phase_a_count = 0
    urgent_alerts: list[dict] = []

    for student in students_list:
        cal = cal_by_user.get(student.id)
        session = sesh_by_user.get(student.id)

        if session:
            phase_a_count += 1

        initials = f"{student.name[0]}{student.last_name[0]}".upper()
        entry = {
            "id": str(student.id),
            "name": f"{student.name} {student.last_name}",
            "initials": initials,
            "email": student.email,
        }

        if cal:
            jol_val = float(cal.jol_average)
            perf_val = float(cal.performance_score)
            gap_val = float(cal.gap)
            cal_idx = float(cal.calibration_index) if cal.calibration_index else None
            cluster = cal.cluster

            total_jol += jol_val
            total_gap += gap_val

            entry.update({
                "jol": round(jol_val, 1),
                "performance": round(perf_val, 1),
                "gap": round(gap_val, 1),
                "calibration_index": round(cal_idx, 2) if cal_idx else None,
                "cluster": cluster,
            })

            cluster_counts[cluster] = cluster_counts.get(cluster, 0) + 1
            cluster_students[cluster].append(entry)

            if abs(gap_val) > 3:
                urgent_alerts.append({
                    **entry,
                    "jol": round(jol_val, 1),
                    "performance": round(perf_val, 1),
                    "gap": round(gap_val, 1),
                    "calibration_index": round(cal_idx, 2) if cal_idx else None,
                    "cluster": cluster,
                    "reason": "crítico" if gap_val > 0 else "subestima mucho",
                    "type": "over" if gap_val > 0 else "sub",
                })

            if cluster == "cal" and cal_idx and cal_idx >= 7:
                calibrated_count += 1
        else:
            entry.update({"jol": None, "performance": None, "gap": None, "calibration_index": None, "cluster": None})
            cluster_students.setdefault("unknown", []).append(entry)

    student_count = len(students_list)
    avg_jol = round(total_jol / phase_a_count, 1) if phase_a_count else 0
    avg_gap = round(total_gap / phase_a_count, 1) if phase_a_count else 0

    return {
        "student_count": student_count,
        "phase_a_completed": phase_a_count,
        "avg_jol": avg_jol,
        "avg_gap": avg_gap,
        "calibrated_count": calibrated_count,
        "cluster_distribution": {
            "over": cluster_counts.get("over", 0),
            "sub": cluster_counts.get("sub", 0),
            "cal": cluster_counts.get("cal", 0),
        },
        "cluster_students": cluster_students,
        "urgent_alerts": urgent_alerts[:10],
    }


def _empty_class_response():
    return {
        "student_count": 0,
        "phase_a_completed": 0,
        "avg_jol": 0,
        "avg_gap": 0,
        "calibrated_count": 0,
        "cluster_distribution": {"over": 0, "sub": 0, "cal": 0},
        "cluster_students": {"over": [], "sub": [], "cal": []},
        "urgent_alerts": [],
    }


@router.get("/experiment/{experiment_id}")
async def get_experiment_analytics(experiment_id: UUID, db: AsyncSession = Depends(get_db)):
    from app.models import Experiment, ExperimentGroup, StudentAssignment

    result = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    experiment = result.scalar_one_or_none()
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    groups_result = await db.execute(
        select(ExperimentGroup).where(ExperimentGroup.experiment_id == experiment_id)
    )
    groups = groups_result.scalars().all()

    groups_data = {}
    for group in groups:
        assignments = await db.execute(
            select(StudentAssignment).where(StudentAssignment.group_id == group.id)
        )
        student_ids = [a.user_id for a in assignments.scalars().all()]

        sessions_data = await db.execute(
            select(Session).where(Session.user_id.in_(student_ids), Session.status == "completed")
        )
        completed_sessions = sessions_data.scalars().all()

        scores = []
        for s in completed_sessions:
            cr = await db.execute(
                select(ChallengeResult).where(ChallengeResult.session_id == s.id)
            )
            scores.extend([float(r.score) for r in cr.scalars().all()])

        groups_data[group.name] = {
            "student_count": len(student_ids),
            "completed_sessions": len(completed_sessions),
            "average_score": sum(scores) / len(scores) if scores else None,
        }

    return {
        "experiment_id": str(experiment.id),
        "experiment_name": experiment.name,
        "is_active": experiment.is_active,
        "created_at": experiment.created_at.isoformat(),
        "groups": groups_data,
    }
