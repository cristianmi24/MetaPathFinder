from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Session, CalibrationResult, CognitiveEvent
from app.schemas import PhaseCComplete
from app.services.calibration import compute_calibration
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/phase-c", tags=["phase-c"], dependencies=[Depends(get_current_user)])


@router.post("/complete", status_code=status.HTTP_201_CREATED)
async def complete_phase_c(payload: PhaseCComplete, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Session).where(Session.id == payload.session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    cal_result = compute_calibration(
        [j.model_dump() for j in payload.jols],
        payload.actual_scores,
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

    for ev in payload.cognitive_events:
        db.add(CognitiveEvent(
            session_id=session.id,
            event_type=ev.event_type,
            timestamp=ev.timestamp,
            metadata_=ev.metadata,
        ))

    await db.commit()
    return {
        "status": "phase_c_completed",
        "session_id": session.id,
        "calibration": cal_result,
    }
