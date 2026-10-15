"""Panel del administrador: intervenciones del tutor por estudiante y por actividad.

Las intervenciones llegan en vivo como eventos `TUTOR_INTERVENTION` (y las respuestas del
estudiante como `TUTOR_RESPONSE`, enlazadas por `ref`). Una *actividad* es el par
(sesión, reto): una sesión puede abarcar varios retos.

- GET /api/tutor/admin/overview            → KPIs de la clase, tabla por estudiante, por reto, feed en vivo
- GET /api/tutor/admin/student/{user_id}   → detalle: perfil del tutor y línea de tiempo por actividad
"""
from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    CalibrationResult, ChallengeResult, CognitiveEvent, Session, StudentTutorState, TutorDecision, User,
)
from app.routers.auth import require_staff
from app.services.tutor import domain, engine

router = APIRouter(prefix="/api/tutor/admin", tags=["tutor-admin"], dependencies=[Depends(require_staff)])

KINDS = ["pista", "pista_auto", "andamiaje", "punto_control", "replanificacion", "freno"]
ACTIVE_WINDOW = timedelta(minutes=5)


def _f(v) -> Optional[float]:
    return float(v) if v is not None else None


def _iso(d: Optional[datetime]) -> Optional[str]:
    return d.isoformat() if d else None


def _intervention(ev: CognitiveEvent, session: Session) -> Dict[str, Any]:
    m = ev.metadata_ or {}
    return {
        "id": m.get("id") or str(ev.id),
        "kind": m.get("kind") if m.get("kind") in KINDS else "andamiaje",
        "level": m.get("level"),
        "tactic": m.get("tactic"),
        "initiator": m.get("initiator") or "tutor",
        "t_seconds": m.get("t_seconds"),
        "p_block": m.get("p_block"),
        "detail": m.get("detail"),
        "challenge_id": m.get("challenge_id") or session.current_challenge_id or "",
        "session_id": session.id,
        "timestamp": _iso(ev.timestamp),
        "response": None,
    }


async def _load_interventions(db: AsyncSession, user_ids: Optional[List[UUID]] = None,
                              since: Optional[datetime] = None) -> List[Tuple[Dict[str, Any], UUID]]:
    q = (
        select(CognitiveEvent, Session)
        .join(Session, Session.id == CognitiveEvent.session_id)
        .where(CognitiveEvent.event_type.in_(("TUTOR_INTERVENTION", "TUTOR_RESPONSE")))
        .order_by(CognitiveEvent.timestamp)
    )
    if user_ids is not None:
        q = q.where(Session.user_id.in_(user_ids))
    if since is not None:
        q = q.where(CognitiveEvent.timestamp >= since)
    rows = (await db.execute(q)).all()
    items: Dict[str, Tuple[Dict[str, Any], UUID]] = {}
    responses: List[Tuple[str, Any]] = []
    for ev, sess in rows:
        if ev.event_type == "TUTOR_RESPONSE":
            m = ev.metadata_ or {}
            responses.append((m.get("ref"), m.get("response")))
            continue
        it = _intervention(ev, sess)
        items.setdefault(it["id"], (it, sess.user_id))  # deduplica reenvíos (vivo + Fase B)
    for ref, resp in responses:
        if ref in items:
            items[ref][0]["response"] = resp
    return list(items.values())


def _ladder(items: List[Dict[str, Any]]) -> Dict[str, int]:
    c: Counter = Counter()
    for it in items:
        if it["kind"] == "andamiaje" and it["level"] in ("N0", "N1", "N2", "N3"):
            c[it["level"]] += 1
        elif it["kind"] in ("pista", "pista_auto") and str(it["level"]) in ("1", "2", "3"):
            c[f"P{it['level']}"] += 1
    return {k: c.get(k, 0) for k in ("N0", "N1", "N2", "N3", "P1", "P2", "P3")}


@router.get("/overview")
async def overview(db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    students = (await db.execute(select(User).where(User.role == "student").order_by(User.name))).scalars().all()
    ids = [u.id for u in students]
    if not ids:
        return {"generated_at": now.isoformat(), "kinds": KINDS, "summary": {}, "students": [], "challenges": [], "feed": [], "by_kind": {}, "ladder": {}}

    states = {r.user_id: engine.ensure_state(r.state) for r in
              (await db.execute(select(StudentTutorState).where(StudentTutorState.user_id.in_(ids)))).scalars().all()}
    sessions = (await db.execute(select(Session).where(Session.user_id.in_(ids)))).scalars().all()
    sess_user = {s.id: s.user_id for s in sessions}
    results = (await db.execute(select(ChallengeResult).where(ChallengeResult.session_id.in_(list(sess_user) or [""])))).scalars().all()
    overrides = Counter(u for (u,) in (await db.execute(
        select(TutorDecision.user_id).where(TutorDecision.kind == "override", TutorDecision.user_id.in_(ids)))).all())
    last_event = dict((await db.execute(
        select(Session.user_id, CognitiveEvent.timestamp)
        .join(Session, Session.id == CognitiveEvent.session_id)
        .where(Session.user_id.in_(ids), CognitiveEvent.timestamp >= now - ACTIVE_WINDOW)
        .order_by(CognitiveEvent.timestamp)
    )).all())

    interventions = await _load_interventions(db, ids)

    # --- actividades (sesión, reto) ---
    activity: Dict[Tuple[str, str], Dict[str, Any]] = {}
    for r in results:
        activity[(r.session_id, r.challenge_id)] = {"user": sess_user[r.session_id], "passed": bool(r.passed), "score": _f(r.score),
                                                     "hints": r.hints_used or 0, "done": True, "n": Counter()}
    for it, uid in interventions:
        key = (it["session_id"], it["challenge_id"])
        a = activity.setdefault(key, {"user": uid, "passed": None, "score": None, "hints": 0, "done": False, "n": Counter()})
        a["n"][it["kind"]] += 1

    # --- por estudiante ---
    per_user: Dict[UUID, Dict[str, Any]] = defaultdict(lambda: {"by_kind": Counter(), "activities": 0, "completed": 0, "passed": 0,
                                                                 "with_help": 0, "passed_with_help": 0, "last": None})
    for it, uid in interventions:
        pu = per_user[uid]
        pu["by_kind"][it["kind"]] += 1
        pu["last"] = max(filter(None, [pu["last"], it["timestamp"]]), default=None)
    for (sid, cid), a in activity.items():
        pu = per_user[a["user"]]
        pu["activities"] += 1
        helped = sum(a["n"].values()) > 0
        if a["done"]:
            pu["completed"] += 1
            pu["passed"] += 1 if a["passed"] else 0
            if helped:
                pu["with_help"] += 1
                pu["passed_with_help"] += 1 if a["passed"] else 0

    rows = []
    for u in students:
        st = states.get(u.id)
        pu = per_user[u.id]
        total = sum(pu["by_kind"].values())
        loc = engine.locate_zdp(st) if st else None
        rows.append({
            "id": str(u.id), "name": f"{u.name} {u.last_name}".strip(), "email": u.email,
            "active_now": u.id in last_event,
            "zdp": loc["zdp"] if loc else None,
            "learning_style": (st or {}).get("learning_style", {}).get("label") if st and st.get("learning_style") else None,
            "last_profile": st.get("last_profile") if st else None,
            "last_bias": st.get("last_bias") if st else None,
            "activities": pu["activities"], "completed": pu["completed"], "passed": pu["passed"],
            "interventions": total,
            "per_activity": round(total / pu["activities"], 2) if pu["activities"] else None,
            "by_kind": {k: pu["by_kind"].get(k, 0) for k in KINDS},
            "with_help": pu["with_help"], "passed_with_help": pu["passed_with_help"],
            "overrides": overrides.get(u.id, 0),
            "last_intervention": pu["last"],
        })

    # --- por reto ---
    per_ch: Dict[str, Dict[str, Any]] = defaultdict(lambda: {"attempts": 0, "completed": 0, "passed": 0, "interventions": 0, "hints": 0,
                                                             "replans": 0, "helped": 0, "helped_passed": 0, "unhelped": 0, "unhelped_passed": 0})
    for (sid, cid), a in activity.items():
        c = per_ch[cid]
        n = sum(a["n"].values())
        c["attempts"] += 1
        c["interventions"] += n
        c["hints"] += a["n"]["pista"] + a["n"]["pista_auto"]
        c["replans"] += a["n"]["replanificacion"]
        if a["done"]:
            c["completed"] += 1
            c["passed"] += 1 if a["passed"] else 0
            if n:
                c["helped"] += 1; c["helped_passed"] += 1 if a["passed"] else 0
            else:
                c["unhelped"] += 1; c["unhelped_passed"] += 1 if a["passed"] else 0
    challenges = sorted(({
        "challenge_id": cid, "attempts": c["attempts"],
        "interventions_per_attempt": round(c["interventions"] / c["attempts"], 2),
        "hints_per_attempt": round(c["hints"] / c["attempts"], 2),
        "replans": c["replans"],
        "pass_rate": round(c["passed"] / c["completed"], 3) if c["completed"] else None,
        "pass_rate_helped": round(c["helped_passed"] / c["helped"], 3) if c["helped"] else None,
        "pass_rate_unhelped": round(c["unhelped_passed"] / c["unhelped"], 3) if c["unhelped"] else None,
    } for cid, c in per_ch.items() if cid), key=lambda r: -r["interventions_per_attempt"])

    all_items = [it for it, _ in interventions]
    by_kind = Counter(it["kind"] for it in all_items)
    n_act = len(activity)
    done = [a for a in activity.values() if a["done"]]
    helped_done = [a for a in done if sum(a["n"].values())]
    unhelped_done = [a for a in done if not sum(a["n"].values())]
    names = {u.id: f"{u.name} {u.last_name}".strip() for u in students}
    feed = [{**it, "student_id": str(uid), "student": names.get(uid, "")} for it, uid in interventions[-40:]][::-1]

    return {
        "generated_at": now.isoformat(),
        "kinds": KINDS,
        "summary": {
            "students": len(students),
            "active_now": len(last_event),
            "activities": n_act,
            "interventions": len(all_items),
            "per_activity": round(len(all_items) / n_act, 2) if n_act else None,
            "activities_with_help": sum(1 for a in activity.values() if sum(a["n"].values())),
            "pass_rate_helped": round(sum(1 for a in helped_done if a["passed"]) / len(helped_done), 3) if helped_done else None,
            "pass_rate_unhelped": round(sum(1 for a in unhelped_done if a["passed"]) / len(unhelped_done), 3) if unhelped_done else None,
            "by_initiator": dict(Counter(it["initiator"] for it in all_items)),
            "overrides": sum(overrides.values()),
            "last_hour": sum(1 for it in all_items if it["timestamp"] and datetime.fromisoformat(it["timestamp"]) >= now - timedelta(hours=1)),
        },
        "by_kind": {k: by_kind.get(k, 0) for k in KINDS},
        "ladder": _ladder(all_items),
        "students": rows,
        "challenges": challenges,
        "feed": feed,
    }


@router.get("/student/{user_id}")
async def student_detail(user_id: UUID, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    st_row = (await db.execute(select(StudentTutorState).where(StudentTutorState.user_id == user_id))).scalar_one_or_none()
    state = engine.ensure_state(st_row.state if st_row else None)
    loc = engine.locate_zdp(state)
    sessions = {s.id: s for s in (await db.execute(select(Session).where(Session.user_id == user_id))).scalars().all()}
    sids = list(sessions) or [""]
    results = (await db.execute(select(ChallengeResult).where(ChallengeResult.session_id.in_(sids)))).scalars().all()
    cals = (await db.execute(select(CalibrationResult).where(CalibrationResult.session_id.in_(sids)))).scalars().all()
    decisions = (await db.execute(select(TutorDecision).where(TutorDecision.user_id == user_id).order_by(TutorDecision.created_at))).scalars().all()
    interventions = [it for it, _ in await _load_interventions(db, [user_id])]

    acts: Dict[Tuple[str, str], Dict[str, Any]] = {}

    def act(sid: str, cid: str) -> Dict[str, Any]:
        s = sessions.get(sid)
        return acts.setdefault((sid, cid), {
            "session_id": sid, "challenge_id": cid, "started_at": _iso(s.started_at) if s else None,
            "completed_at": None, "strategy_id": s.assigned_strategy_id if s else None,
            "result": None, "calibration": None, "reading": None, "feedback": None, "reflection_text": None,
            "plan": None, "overrides": [], "interventions": [],
        })

    for r in results:
        a = act(r.session_id, r.challenge_id)
        a["completed_at"] = _iso(r.completed_at)
        a["result"] = {"score": _f(r.score), "passed": bool(r.passed), "time_spent_seconds": r.time_spent_seconds,
                       "attempts": r.attempts, "hints_used": r.hints_used, "clicks": r.clicks}
    for c in cals:
        a = act(c.session_id, c.challenge_id)
        a["calibration"] = {"jol": _f(c.jol_average), "performance": _f(c.performance_score), "gap": _f(c.gap),
                            "cluster": c.cluster, "calibration_index": _f(c.calibration_index)}
        a["reflection_text"] = c.reflection_text
    for it in interventions:
        act(it["session_id"], it["challenge_id"])["interventions"].append(it)
    for d in decisions:
        p = d.payload or {}
        if d.kind == "plan" and d.session_id:
            cid = (p.get("challenge") or {}).get("challenge_id")
            if cid and (d.session_id, cid) in acts:
                acts[(d.session_id, cid)]["plan"] = {"strategy": p.get("strategy"), "challenge_reason": (p.get("challenge") or {}).get("reason"), "group": p.get("group")}
        elif d.kind == "phase_c" and d.session_id:
            cid = p.get("challenge_id") or (sessions[d.session_id].current_challenge_id if d.session_id in sessions else None)
            if cid:
                a = act(d.session_id, cid)
                a["reading"], a["feedback"] = p.get("reading"), p.get("feedback")
                a["reflection_text"] = a["reflection_text"] or p.get("reflection_text")
                if p.get("calibration") and a["calibration"] is not None:
                    a["calibration"].update({k: v for k, v in p["calibration"].items() if v is not None})
        elif d.kind == "override":
            entry = {"kind": p.get("kind"), "chosen": p.get("chosen"), "suggested": p.get("suggested"),
                     "reason": p.get("reason"), "at": _iso(d.created_at)}
            if d.session_id and any(k[0] == d.session_id for k in acts):
                key = next(k for k in acts if k[0] == d.session_id)
                acts[key]["overrides"].append(entry)

    activities = []
    for a in acts.values():
        a["interventions"].sort(key=lambda it: (it["t_seconds"] is None, it["t_seconds"] or 0, it["timestamp"] or ""))
        a["counts"] = {k: sum(1 for it in a["interventions"] if it["kind"] == k) for k in KINDS}
        a["total_interventions"] = len(a["interventions"])
        a["ladder"] = _ladder(a["interventions"])
        activities.append(a)
    activities.sort(key=lambda a: a["completed_at"] or a["started_at"] or "", reverse=True)

    total = len(interventions)
    done = [a for a in activities if a["result"]]
    return {
        "student": {"id": str(user.id), "name": f"{user.name} {user.last_name}".strip(), "email": user.email,
                    "created_at": _iso(user.created_at)},
        "tutor": {
            "zdp": {k: v for k, v in loc.items() if k != "criteria"},
            "criteria": {k: {"p": v["p"], "n": v["n"], "mastered": v["mastered"], "level": v["level"], "text": v["text"]} for k, v in loc["criteria"].items()},
            "overlay": {c: v["zdp_step"] for c, v in engine.tech_overlay(state).items()},
            "learning_style": state.get("learning_style"),
            "last_profile": state.get("last_profile"), "last_bias": state.get("last_bias"),
            "last_strategy": state.get("last_strategy"),
        },
        "summary": {
            "activities": len(activities), "completed": len(done),
            "passed": sum(1 for a in done if a["result"]["passed"]),
            "interventions": total,
            "per_activity": round(total / len(activities), 2) if activities else None,
            "by_kind": {k: sum(1 for it in interventions if it["kind"] == k) for k in KINDS},
            "by_initiator": dict(Counter(it["initiator"] for it in interventions)),
            "ladder": _ladder(interventions),
            "overrides": sum(1 for d in decisions if d.kind == "override"),
        },
        "kinds": KINDS,
        "criteria_order": [c["id"] for c in domain.CRITERIA],
        "activities": activities,
    }
