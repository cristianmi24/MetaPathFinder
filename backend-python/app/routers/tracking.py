"""Persistencia de eventos cognitivos en tiempo real (/api/tracking/events).

El frontend vacía su cola de eventos por lotes. Si no indica sesión se usa la
última sesión en curso del usuario; si no hay ninguna, se aceptan y descartan
(no hay a qué asociarlos) para no bloquear al cliente.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import CognitiveEvent, Session, User
from app.routers.auth import get_current_user
from app.schemas import TrackingBatch

router = APIRouter(prefix="/api/tracking", tags=["tracking"], dependencies=[Depends(get_current_user)])


@router.post("/events", status_code=202)
async def track_events(payload: TrackingBatch, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not payload.events:
        return {"status": "empty", "stored": 0}
    session = None
    if payload.session_id:
        session = (await db.execute(select(Session).where(Session.id == payload.session_id))).scalar_one_or_none()
        if session and session.user_id != current_user.id and current_user.role != "admin":
            session = None
    if session is None:
        session = (await db.execute(
            select(Session).where(Session.user_id == current_user.id, Session.status == "in_progress")
            .order_by(Session.started_at.desc()).limit(1)
        )).scalar_one_or_none()
    if session is None:
        return {"status": "no_session", "stored": 0}
    db.add_all([
        CognitiveEvent(session_id=session.id, event_type=ev.event_type[:50],
                       timestamp=ev.timestamp or datetime.now(timezone.utc), metadata_=ev.metadata)
        for ev in payload.events
    ])
    await db.commit()
    return {"status": "stored", "stored": len(payload.events), "session_id": session.id}
