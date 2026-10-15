"""Seguimiento del grupo para el panel de administración: estado en vivo, tiempos, calibración y progresión."""
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Session, ChallengeResult, CalibrationResult
from app.routers.auth import require_staff

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

# Colombia no usa horario de verano: los días del gráfico se cuentan en hora local (UTC-5).
LOCAL_TZ = timezone(timedelta(hours=-5))

_LEVEL_RANK = {"RB": 0, "RM": 1, "RA": 2}


def _challenge_rank(challenge_id: str | None) -> int | None:
    """RB-C1-N2 → posición en la escala de dificultad (básico N1 = 0 … avanzado N3 = 8)."""
    if not challenge_id:
        return None
    parts = challenge_id.split("-")
    if len(parts) < 3 or parts[0] not in _LEVEL_RANK or not parts[2].startswith("N"):
        return None
    try:
        return _LEVEL_RANK[parts[0]] * 3 + int(parts[2][1:]) - 1
    except ValueError:
        return None


def _f(v) -> float | None:
    return round(float(v), 2) if v is not None else None


def _avg(values: list[float]) -> float | None:
    return round(sum(values) / len(values), 2) if values else None


@router.get("/monitor", dependencies=[Depends(require_staff)])
async def get_monitor(db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)

    students = (await db.execute(select(User).where(User.role == "student").order_by(User.name))).scalars().all()
    student_ids = [s.id for s in students]

    sessions = (
        (await db.execute(select(Session).where(Session.user_id.in_(student_ids)).order_by(Session.started_at)))
        .scalars().all()
        if student_ids else []
    )
    session_ids = [s.id for s in sessions]
    results = (
        (await db.execute(select(ChallengeResult).where(ChallengeResult.session_id.in_(session_ids)))).scalars().all()
        if session_ids else []
    )
    calibrations = (
        (await db.execute(select(CalibrationResult).where(CalibrationResult.session_id.in_(session_ids)))).scalars().all()
        if session_ids else []
    )

    result_by_session = {r.session_id: r for r in results}
    cal_by_session = {c.session_id: c for c in calibrations}
    sessions_by_user: dict = defaultdict(list)
    for s in sessions:
        sessions_by_user[s.user_id].append(s)

    def stage(s: Session) -> str:
        if s.id in cal_by_session or s.status == "completed":
            return "terminado"
        if s.id in result_by_session:
            return "reflexion"
        return "actividad"

    rows = []
    status_counts = {"activo": 0, "terminado": 0, "sin_empezar": 0, "inactivo": 0}
    trend_counts = {"subio": 0, "bajo": 0, "igual": 0}

    for st in students:
        ss = sessions_by_user.get(st.id, [])
        last = ss[-1] if ss else None
        finished = [s for s in ss if stage(s) == "terminado"]
        times = [result_by_session[s.id].time_spent_seconds for s in ss if s.id in result_by_session]
        last_cal = next((cal_by_session[s.id] for s in reversed(ss) if s.id in cal_by_session), None)

        if not last:
            status = "sin_empezar"
        elif stage(last) == "terminado":
            status = "terminado"
        elif (now - last.started_at) <= timedelta(minutes=90):
            status = "activo"
        else:
            status = "inactivo"  # empezó y no terminó
        status_counts[status] += 1

        # Tendencia: dificultad del último reto frente al anterior (lo decide el sistema según el resultado)
        ranks = [r for r in (_challenge_rank(s.current_challenge_id) for s in ss) if r is not None]
        trend = None
        if len(ranks) >= 2:
            trend = "subio" if ranks[-1] > ranks[-2] else "bajo" if ranks[-1] < ranks[-2] else "igual"
            trend_counts[trend] += 1

        rows.append({
            "id": str(st.id),
            "name": f"{st.name} {st.last_name}".strip(),
            "email": st.email,
            "status": status,
            "stage": stage(last) if last else None,
            "current_challenge": last.current_challenge_id if last else None,
            "started_at": last.started_at.isoformat() if last else None,
            "elapsed_seconds": int((now - last.started_at).total_seconds()) if last and status == "activo" else None,
            "sessions": len(ss),
            "completed": len(finished),
            "avg_time_seconds": int(sum(times) / len(times)) if times else None,
            "jol": _f(last_cal.jol_average) if last_cal else None,
            "performance": _f(last_cal.performance_score) if last_cal else None,
            "gap": _f(last_cal.gap) if last_cal else None,
            "cluster": last_cal.cluster if last_cal else None,
            "trend": trend,
            "strategy": last.assigned_strategy_id if last else None,
        })

    # Estadísticas por reto
    by_challenge: dict = defaultdict(lambda: {"times": [], "scores": [], "passed": 0, "n": 0, "jol": [], "perf": []})
    session_challenge = {s.id: s.current_challenge_id for s in sessions}
    for r in results:
        b = by_challenge[r.challenge_id]
        b["n"] += 1
        b["times"].append(r.time_spent_seconds or 0)
        b["scores"].append(float(r.score))
        b["passed"] += 1 if r.passed else 0
    for c in calibrations:
        cid = c.challenge_id or session_challenge.get(c.session_id)
        by_challenge[cid]["jol"].append(float(c.jol_average))
        by_challenge[cid]["perf"].append(float(c.performance_score))
    challenges = sorted(
        (
            {
                "challenge_id": cid,
                "attempts": b["n"],
                "avg_time_seconds": int(sum(b["times"]) / len(b["times"])) if b["times"] else None,
                "avg_score": _avg(b["scores"]),
                "pass_rate": round(100 * b["passed"] / b["n"], 1) if b["n"] else None,
                "avg_jol": _avg(b["jol"]),
                "avg_performance": _avg(b["perf"]),
            }
            for cid, b in by_challenge.items() if cid
        ),
        key=lambda x: x["challenge_id"],
    )

    # Participación de los últimos 14 días
    start_day = (now.astimezone(LOCAL_TZ) - timedelta(days=13)).date()
    days = [(start_day + timedelta(days=i)).isoformat() for i in range(14)]
    started_per_day = dict.fromkeys(days, 0)
    finished_per_day = dict.fromkeys(days, 0)
    for s in sessions:
        d = s.started_at.astimezone(LOCAL_TZ).date().isoformat()
        if d in started_per_day:
            started_per_day[d] += 1
    for c in calibrations:
        d = c.created_at.astimezone(LOCAL_TZ).date().isoformat()
        if d in finished_per_day:
            finished_per_day[d] += 1

    # Estrategias asignadas
    strat: dict = defaultdict(lambda: {"n": 0, "gaps": []})
    for s in sessions:
        if s.assigned_strategy_id:
            strat[s.assigned_strategy_id]["n"] += 1
            if s.id in cal_by_session:
                strat[s.assigned_strategy_id]["gaps"].append(abs(float(cal_by_session[s.id].gap)))

    cluster_counts = {"over": 0, "sub": 0, "cal": 0}
    for r in rows:
        if r["cluster"] in cluster_counts:
            cluster_counts[r["cluster"]] += 1

    all_times = [r.time_spent_seconds for r in results if r.time_spent_seconds]
    return {
        "generated_at": now.isoformat(),
        "summary": {
            "students": len(students),
            **status_counts,
            "sessions": len(sessions),
            "activities_completed": len(calibrations),
            "avg_time_seconds": int(sum(all_times) / len(all_times)) if all_times else None,
            "pass_rate": round(100 * sum(1 for r in results if r.passed) / len(results), 1) if results else None,
            "avg_jol": _avg([float(c.jol_average) for c in calibrations]),
            "avg_performance": _avg([float(c.performance_score) for c in calibrations]),
        },
        "clusters": cluster_counts,
        "trends": trend_counts,
        "students": rows,
        "challenges": challenges,
        "participation": [
            {"day": d, "started": started_per_day[d], "finished": finished_per_day[d]} for d in days
        ],
        "strategies": [
            {"strategy": k, "assigned": v["n"], "avg_abs_gap": _avg(v["gaps"])} for k, v in sorted(strat.items())
        ],
    }
