from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.models import Session, User
from app.schemas import SessionComplete
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/sessions", tags=["sessions"], dependencies=[Depends(get_current_user)])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_session(payload: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == payload["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session = Session(
        id=payload["session_id"],
        user_id=payload["user_id"],
        current_level=payload.get("current_level", 1),
        current_challenge_id=payload.get("current_challenge_id"),
        assigned_strategy_id=payload.get("assigned_strategy_id"),
        strategy_assigned_randomly=payload.get("strategy_assigned_randomly", False),
        experiment_group=payload.get("experiment_group"),
    )
    db.add(session)
    await db.commit()
    return {"status": "created", "session_id": session.id}


@router.patch("/{session_id}/complete")
async def complete_session(session_id: str, payload: SessionComplete, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Session).where(Session.id == session_id).with_for_update()
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.status = "completed"
    session.total_time_seconds = payload.total_time_seconds
    session.total_clicks = payload.total_clicks
    session.total_navigations = payload.total_navigations
    session.final_score = payload.final_score
    session.completed_at = payload.completed_at

    await db.commit()
    return {"status": "completed"}


@router.post("/{session_id}/events")
async def batch_events(session_id: str, payload: dict, db: AsyncSession = Depends(get_db)):
    from app.models import CognitiveEvent
    from datetime import datetime

    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    events = []
    for ev in payload.get("events", []):
        events.append(CognitiveEvent(
            session_id=session_id,
            event_type=ev["event_type"],
            timestamp=ev.get("timestamp", datetime.utcnow()),
            metadata_=ev.get("metadata", {}),
        ))

    db.add_all(events)
    await db.commit()
    return {"status": "received", "count": len(events)}
