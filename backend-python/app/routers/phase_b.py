from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Session, ChallengeResult, CognitiveEvent
from app.schemas import PhaseBComplete
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/phase-b", tags=["phase-b"], dependencies=[Depends(get_current_user)])


@router.post("/complete", status_code=status.HTTP_201_CREATED)
async def complete_phase_b(payload: PhaseBComplete, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Session).where(Session.id == payload.session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Create session first via Phase A.")

    cr_data = payload.challenge_result
    challenge_result = ChallengeResult(
        session_id=session.id,
        challenge_id=cr_data.challenge_id,
        score=cr_data.score,
        max_score=cr_data.max_score,
        time_spent_seconds=cr_data.time_spent_seconds,
        clicks=cr_data.clicks,
        mouse_distance=cr_data.mouse_distance,
        attempts=cr_data.attempts,
        hints_used=cr_data.hints_used,
        passed=cr_data.passed,
    )
    db.add(challenge_result)

    for ev in payload.cognitive_events:
        db.add(CognitiveEvent(
            session_id=session.id,
            event_type=ev.event_type,
            timestamp=ev.timestamp,
            metadata_=ev.metadata,
        ))

    session.current_challenge_id = cr_data.challenge_id

    await db.commit()
    return {"status": "phase_b_completed", "session_id": session.id}
