from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Session
from app.schemas import PhaseAComplete
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/phase-a", tags=["phase-a"], dependencies=[Depends(get_current_user)])


@router.post("/complete", status_code=status.HTTP_201_CREATED)
async def complete_phase_a(payload: PhaseAComplete, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Session).where(Session.id == payload.session_id))
    if existing.scalar_one_or_none():
        return {"status": "already_exists", "session_id": payload.session_id}

    session = Session(
        id=payload.session_id,
        user_id=payload.user_id,
        current_level=payload.current_level,
        current_challenge_id=payload.current_challenge_id,
        assigned_strategy_id=payload.assigned_strategy_id,
        strategy_assigned_randomly=payload.strategy_assigned_randomly,
        experiment_group=payload.experiment_group,
    )
    db.add(session)
    await db.flush()
    await db.commit()
    return {"status": "phase_a_completed", "session_id": session.id}
