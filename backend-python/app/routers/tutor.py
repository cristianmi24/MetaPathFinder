"""Endpoints del sistema tutor (Griffin + Bayes).

- GET  /api/tutor/domain                 → base de conocimiento (misma fuente de verdad para el cliente)
- GET  /api/tutor/state/{user_id}        → ZDP, criterios, overlay técnico, estilo, historial
- POST /api/tutor/plan                   → Fase A: reto, estrategia y tipo de andamiaje (+ explicación)
- POST /api/tutor/override               → agencia del estudiante: rechaza una sugerencia
- POST /api/tutor/learning-style         → estilo de aprendizaje (Felder-Silverman abreviado)
- POST /api/tutor/resource-rating        → 👍/👎 de un recurso
- GET  /api/tutor/recommend/{user_id}    → recurso alternativo por pares (k-NN)
- GET  /api/tutor/class-map              → mapa de progresión de la clase (docentes)
"""
from __future__ import annotations

import os
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    ExperimentGroup, ResourceRating, Session, StudentAssignment, StudentTutorState, TutorDecision, User,
)
from app.routers.auth import ensure_self_or_staff, get_current_user, require_staff
from app.schemas import LearningStyleInput, ResourceRatingInput, TutorOverride, TutorPlanRequest
from app.services.tutor import domain, engine

router = APIRouter(prefix="/api/tutor", tags=["tutor"], dependencies=[Depends(get_current_user)])

DEFAULT_GROUP = os.environ.get("TUTOR_DEFAULT_GROUP", "experimental")


async def load_state(db: AsyncSession, user_id: UUID) -> StudentTutorState:
    row = (await db.execute(select(StudentTutorState).where(StudentTutorState.user_id == user_id))).scalar_one_or_none()
    if row is None:
        row = StudentTutorState(user_id=user_id, state=engine.new_state())
        db.add(row)
        await db.flush()
    else:
        row.state = engine.ensure_state(row.state)
    return row


async def resolve_group(db: AsyncSession, user_id: UUID) -> str:
    """'control' si el estudiante está asignado a un grupo cuyo nombre contiene "control"."""
    q = (
        select(ExperimentGroup.name)
        .join(StudentAssignment, StudentAssignment.group_id == ExperimentGroup.id)
        .where(StudentAssignment.user_id == user_id)
        .order_by(StudentAssignment.assigned_at.desc())
        .limit(1)
    )
    name = (await db.execute(q)).scalar_one_or_none()
    if name and "control" in name.lower():
        return "control"
    if name:
        return "experimental"
    return DEFAULT_GROUP


def _persist_summary(row: StudentTutorState) -> None:
    loc = engine.locate_zdp(row.state)
    row.zdp_meta = loc["zdp"]
    overlay = engine.tech_overlay(row.state)
    steps = [v["zdp_step"] for v in overlay.values()]
    row.zdp_tech = min(steps, key=lambda s: domain.TECH_LADDER.index(s)) if steps else None
    row.learning_style = row.state.get("learning_style")


def _state_payload(row: StudentTutorState, group: str) -> Dict[str, Any]:
    loc = engine.locate_zdp(row.state)
    return {
        "user_id": str(row.user_id),
        "group": group,
        "zdp": {k: v for k, v in loc.items() if k != "criteria"},
        "criteria": loc["criteria"],
        "overlay": engine.tech_overlay(row.state),
        "learning_style": row.state.get("learning_style"),
        "last_profile": row.state.get("last_profile"),
        "last_bias": row.state.get("last_bias"),
        "last_strategy": row.state.get("last_strategy"),
        "strategies": row.state.get("strategies"),
        "challenges_done": row.state.get("challenges_done", []),
        "history": row.state.get("history", []),
        "scaffold": engine.scaffold_plan(loc["zdp"], row.state.get("profile")),
        "profile": engine.learner.summary(row.state.get("profile") or {}),
    }


@router.get("/domain")
async def get_domain():
    return domain.tutor_domain_payload()


@router.get("/state/{user_id}")
async def get_state(user_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_self_or_staff(current_user, user_id)
    row = await load_state(db, user_id)
    group = await resolve_group(db, user_id)
    await db.commit()
    return _state_payload(row, group)


@router.post("/plan")
async def plan(payload: TutorPlanRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_self_or_staff(current_user, payload.user_id)
    row = await load_state(db, payload.user_id)
    group = await resolve_group(db, payload.user_id)
    result = engine.plan_session(row.state, payload.level_name, payload.available, group)
    db.add(TutorDecision(user_id=payload.user_id, session_id=payload.session_id, kind="plan", payload={
        "level_name": payload.level_name, "challenge": result["challenge"], "strategy": result["strategy"],
        "zdp": result["zdp"], "group": group,
    }))
    await db.commit()
    return result


@router.post("/override")
async def override(payload: TutorOverride, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_self_or_staff(current_user, payload.user_id)
    db.add(TutorDecision(user_id=payload.user_id, session_id=payload.session_id, kind="override",
                         payload=payload.model_dump(mode="json", exclude={"user_id"})))
    await db.commit()
    return {"status": "recorded"}


@router.post("/learning-style")
async def learning_style(payload: LearningStyleInput, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_self_or_staff(current_user, payload.user_id)
    row = await load_state(db, payload.user_id)
    style = {
        "visual_verbal": payload.visual_verbal,
        "global_sequential": payload.global_sequential,
        "label": f"{'Visual' if payload.visual_verbal >= 0 else 'Verbal'} · {'Global' if payload.global_sequential >= 0 else 'Secuencial'}",
        "answers": payload.answers,
    }
    state = dict(row.state)
    state["learning_style"] = style
    row.state = state
    _persist_summary(row)
    await db.commit()
    return {"status": "saved", "learning_style": style}


@router.post("/resource-rating")
async def rate_resource(payload: ResourceRatingInput, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ensure_self_or_staff(current_user, payload.user_id)
    db.add(ResourceRating(user_id=payload.user_id, resource_id=payload.resource_id,
                          challenge_id=payload.challenge_id, helpful=payload.helpful))
    await db.commit()
    return {"status": "saved"}


def _style_vec(state: Dict[str, Any]) -> List[float]:
    ls = state.get("learning_style") or {}
    loc = engine.locate_zdp(state)
    bias = state.get("last_bias")
    return [
        float(ls.get("visual_verbal", 0.0)),
        float(ls.get("global_sequential", 0.0)),
        domain.LEVELS.index(loc["zdp"]) / 2.0,
        max(-1.0, min(1.0, (bias or 0.0) / 5.0)),
    ]


@router.get("/recommend/{user_id}")
async def recommend(user_id: UUID, challenge_id: Optional[str] = None, exclude: Optional[str] = None,
                    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Recurso mejor valorado por los k estudiantes más parecidos (k-NN sobre estilo, ZDP y sesgo)."""
    ensure_self_or_staff(current_user, user_id)
    me = await load_state(db, user_id)
    others = (await db.execute(select(StudentTutorState).where(StudentTutorState.user_id != user_id))).scalars().all()
    mine = _style_vec(me.state)
    neighbours = sorted(
        others, key=lambda r: sum((a - b) ** 2 for a, b in zip(mine, _style_vec(engine.ensure_state(r.state))))
    )[:5]
    ids = [r.user_id for r in neighbours]
    if not ids:
        return {"resource_id": None, "source": "sin_pares", "neighbours": 0}
    q = (
        select(ResourceRating.resource_id,
               func.sum(case((ResourceRating.helpful.is_(True), 1), else_=0)).label("ok"),
               func.count().label("n"))
        .where(ResourceRating.user_id.in_(ids))
        .group_by(ResourceRating.resource_id)
    )
    if challenge_id:
        q = q.where(ResourceRating.challenge_id == challenge_id)
    rows = (await db.execute(q)).all()
    ranked = sorted(
        [r for r in rows if r.resource_id != exclude],
        key=lambda r: ((r.ok + 1) / (r.n + 2)), reverse=True,  # media bayesiana (Laplace)
    )
    await db.commit()
    if not ranked:
        return {"resource_id": None, "source": "sin_valoraciones", "neighbours": len(ids)}
    best = ranked[0]
    return {"resource_id": best.resource_id, "helpful_ratio": round((best.ok + 1) / (best.n + 2), 2),
            "neighbours": len(ids), "source": "knn"}


@router.get("/class-map", dependencies=[Depends(require_staff)])
async def class_map(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(StudentTutorState, User.name, User.last_name, User.email)
        .join(User, User.id == StudentTutorState.user_id)
    )).all()
    students = []
    by_zdp: Dict[str, int] = {lvl: 0 for lvl in domain.LEVELS}
    for row, name, last_name, email in rows:
        state = engine.ensure_state(row.state)
        loc = engine.locate_zdp(state)
        overlay = engine.tech_overlay(state)
        by_zdp[loc["zdp"]] += 1
        students.append({
            "user_id": str(row.user_id), "name": f"{name} {last_name}".strip(), "email": email,
            "zdp": loc["zdp"], "consolidated": loc["consolidated"], "pending": loc["pending_criteria"],
            "criteria": {k: v["p"] for k, v in loc["criteria"].items()},
            "tech": {comp: v["zdp_step"] for comp, v in overlay.items()},
            "last_profile": state.get("last_profile"), "last_bias": state.get("last_bias"),
            "learning_style": (state.get("learning_style") or {}).get("label"),
            "challenges_done": len(state.get("challenges_done", [])),
            "last_reading": (state.get("history") or [{}])[-1].get("level") if state.get("history") else None,
        })
    return {"students": students, "by_zdp": by_zdp, "levels": domain.LEVEL_LABELS, "criteria": domain.CRITERIA}
