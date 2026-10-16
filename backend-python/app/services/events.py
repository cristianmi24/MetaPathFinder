"""Guardado de eventos cognitivos sin duplicados.

Los eventos llegan por dos vías: en vivo (/api/tracking/events, cada 10 s) y en el cierre de
cada fase, que reenvía lo que no salió en vivo. Si el envío en vivo coincide con el cierre, el
mismo evento llega dos veces y se contarían dobles los intentos y los aciertos. Un evento se
identifica por su tipo y su marca de tiempo (milisegundos del cliente) dentro de la sesión.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Iterable, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import CognitiveEvent


def _key(event_type: str, ts: Optional[datetime]) -> Tuple[str, Optional[str]]:
    if ts is None:
        return event_type, None
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    return event_type, ts.astimezone(timezone.utc).isoformat(timespec="milliseconds")


async def add_events_dedup(db: AsyncSession, session_id: str, events: Iterable[Any]) -> int:
    """Añade los eventos (objetos con event_type, timestamp, metadata) que no estén ya guardados."""
    events = list(events)
    if not events:
        return 0
    rows = await db.execute(
        select(CognitiveEvent.event_type, CognitiveEvent.timestamp).where(CognitiveEvent.session_id == session_id)
    )
    seen = {_key(t, ts) for t, ts in rows.all()}
    added = 0
    for ev in events:
        etype = str(ev.event_type)[:50]
        ts = ev.timestamp or datetime.now(timezone.utc)
        k = _key(etype, ts)
        if k in seen:
            continue
        seen.add(k)
        db.add(CognitiveEvent(session_id=session_id, event_type=etype, timestamp=ts, metadata_=ev.metadata))
        added += 1
    return added
