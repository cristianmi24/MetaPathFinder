from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Session, CalibrationResult, CognitiveEvent, TutorDecision
from app.schemas import PhaseCComplete
from app.services.calibration import compute_calibration
from app.services.tutor import engine as tutor_engine
from app.routers.tutor import load_state, resolve_group, _persist_summary
from app.models import User
from app.routers.auth import get_current_user, ensure_self_or_staff
from app.services.events import add_events_dedup

router = APIRouter(prefix="/api/phase-c", tags=["phase-c"], dependencies=[Depends(get_current_user)])


@router.post("/complete", status_code=status.HTTP_201_CREATED)
async def complete_phase_c(
    payload: PhaseCComplete, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Session).where(Session.id == payload.session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    ensure_self_or_staff(current_user, session.user_id)

    cal_result = compute_calibration(
        [j.model_dump() for j in payload.jols],
        payload.actual_scores,
        estimated_minutes=payload.estimated_minutes,
        actual_minutes=payload.actual_minutes,
    )

    confidences = cal_result["confianzas_normalizadas"]
    jol_average = sum(confidences) / len(confidences) if confidences else 0.0
    performance_avg = (
        sum(cal_result["resultados_normalizados"]) / len(cal_result["resultados_normalizados"])
        if cal_result["resultados_normalizados"]
        else 0.0
    )
    raw_gap = jol_average - performance_avg
    gap = round(raw_gap, 2)

    if raw_gap > 2:
        cluster = "over"
    elif raw_gap < -2:
        cluster = "sub"
    else:
        cluster = "cal"

    calibration = CalibrationResult(
        session_id=session.id,
        challenge_id=session.current_challenge_id or "",
        jol_average=jol_average,
        performance_score=performance_avg,
        gap=gap,
        cluster=cluster,
        calibration_index=cal_result["calibracion"],
        reflection_text=payload.reflection_text,
    )
    db.add(calibration)

    await add_events_dedup(db, session.id, payload.cognitive_events)

    # --- Sistema tutor: lectura del reto, actualización bayesiana y retroalimentación ---
    tutor_payload = None
    if payload.tutor_observations is not None:
        row = await load_state(db, session.user_id)
        group = await resolve_group(db, session.user_id)
        challenge = payload.challenge or {"id": session.current_challenge_id or "", "criterios": [], "titulo": ""}
        if not challenge.get("id"):
            challenge["id"] = session.current_challenge_id or ""
        obs = dict(payload.tutor_observations)
        obs.setdefault("reflection_text", payload.reflection_text)
        obs.setdefault("strategy_id", session.assigned_strategy_id)
        result = tutor_engine.process_phase_c(row.state, obs, cal_result, challenge, group, session.id)
        row.state = result.pop("state")
        _persist_summary(row)
        tutor_payload = {**result, "group": group}
        db.add(TutorDecision(user_id=session.user_id, session_id=session.id, kind="phase_c", payload={
            "reading": result["reading"], "indicators": result["indicators"], "criteria_observed": result["criteria_observed"],
            "feedback": result["feedback"], "strategy_outcome": result["strategy_outcome"], "zdp_after": result["zdp_after"],
            "attempts": result["attempts"], "difficulty": result["difficulty"],
            "challenge_id": challenge.get("id"), "reflection_text": payload.reflection_text,
            "calibration": {k: cal_result.get(k) for k in ("bias_index", "banda", "cluster", "brier", "time_calibration")},
        }))

    await db.commit()
    return {
        "status": "phase_c_completed",
        "session_id": session.id,
        "calibration": cal_result,
        "tutor": tutor_payload,
    }
