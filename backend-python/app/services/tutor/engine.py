"""Módulos Estudiante y Tutor: ciclo de Griffin (evaluar → ubicar → andamiar → reevaluar).

El estado del estudiante es un diccionario JSON (persistido en `student_tutor_state`):
{
  "criteria":   {"B1": [a, b], ...},            # Beta-Bernoulli por criterio metacognitivo
  "fading":     {"M2": n_exitos_sin_ayuda},      # para retirar apoyos (fading)
  "tech":       {"C1": {"RB-N1": [a, b], ...}},  # Beta-Bernoulli por escalón técnico y componente
  "strategies": {"over": {"est2": [a, b], ...}}, # brazos de Thompson por perfil de calibración
  "last_bias": float | None, "last_strategy": str | None, "last_profile": str | None,
  "last_bias_adj": float | None, "last_step": str | None,      # sesgo ajustado por dificultad y su escalón
  "profile":    {...},                           # perfil dinámico (ver profile.py)
  "challenges_done": [...], "history": [...]
}
"""
from __future__ import annotations

from datetime import datetime, timezone

import random
from copy import deepcopy
from typing import Any, Dict, List, Optional, Tuple

from . import domain
from .bayes import (
    beta_credible_interval, beta_mean, beta_observations, beta_update, blocking_probability,
    indicator_contributions, is_mastered, naive_bayes_bernoulli, thompson_choose,
)
from .indicators import attempt_summary, behavior_indicators, criterion_observations, text_indicators
from . import profile as learner


# --------------------------------------------------------------------------- #
# Estado
# --------------------------------------------------------------------------- #
def new_state() -> Dict[str, Any]:
    return {
        "version": 1,
        "criteria": {c["id"]: [1.0, 1.0] for c in domain.CRITERIA},
        "fading": {c["id"]: 0 for c in domain.CRITERIA},
        "tech": {comp: {step: [1.0, 1.0] for step in domain.TECH_LADDER} for comp in domain.COMPONENTS},
        "strategies": {
            profile: {
                s: ([2.0, 1.0] if s in domain.RECOMMENDED_BY_PROFILE.get(profile, []) else [1.0, 1.0])
                for s in domain.STRATEGIES
            }
            for profile in ("over", "sub", "cal")
        },
        "last_bias": None,
        "last_strategy": None,
        "last_profile": None,
        "learning_style": None,
        "profile": learner.new_profile(),
        "challenges_done": [],
        "history": [],
    }


def ensure_state(state: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    base = new_state()
    if not state:
        return base
    merged = deepcopy(base)
    for k, v in state.items():
        if isinstance(v, dict) and isinstance(merged.get(k), dict):
            merged[k].update(v)
        else:
            merged[k] = v
    merged["profile"] = learner.ensure_profile(state.get("profile"))
    for comp in domain.COMPONENTS:
        merged["tech"].setdefault(comp, {})
        for step in domain.TECH_LADDER:
            merged["tech"][comp].setdefault(step, [1.0, 1.0])
    return merged


# --------------------------------------------------------------------------- #
# Ubicación (Griffin): nivel consolidado y ZDP
# --------------------------------------------------------------------------- #
def criteria_summary(state: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    out = {}
    for c in domain.CRITERIA:
        a, b = state["criteria"].get(c["id"], [1.0, 1.0])
        lo, hi = beta_credible_interval(a, b)
        out[c["id"]] = {
            "level": c["level"], "dimension": c["dimension"], "text": c["text"],
            "p": round(beta_mean(a, b), 3), "ci": [round(lo, 3), round(hi, 3)],
            "n": beta_observations(a, b),
            "mastered": is_mastered(a, b, domain.MASTERY_THRESHOLD, domain.MIN_OBSERVATIONS),
            "faded": state["fading"].get(c["id"], 0) >= domain.FADING_SUCCESSES,
        }
    return out


def locate_zdp(state: Dict[str, Any]) -> Dict[str, Any]:
    summary = criteria_summary(state)
    consolidated: Optional[str] = None
    for lvl in domain.LEVELS:
        ids = domain.CRITERIA_BY_LEVEL[lvl]
        mastered = sum(1 for cid in ids if summary[cid]["mastered"])
        if mastered >= domain.CRITERIA_TO_CONSOLIDATE:
            consolidated = lvl
        else:
            break
    if consolidated is None:
        zdp = "basico"
    elif consolidated == "avanzado":
        zdp = "avanzado"  # se retira el andamiaje; solo se pide transferencia
    else:
        zdp = domain.LEVELS[domain.LEVELS.index(consolidated) + 1]
    pending = [cid for cid in domain.CRITERIA_BY_LEVEL[zdp] if not summary[cid]["mastered"]]
    return {
        "consolidated": consolidated,
        "zdp": zdp,
        "zdp_label": domain.LEVEL_LABELS[zdp],
        "pending_criteria": pending,
        "fading": consolidated == "avanzado",
        "criteria": summary,
    }


def tech_overlay(state: Dict[str, Any]) -> Dict[str, Any]:
    """Modelo overlay técnico: estado de cada escalón por componente (verde/amarillo/gris)."""
    overlay: Dict[str, Any] = {}
    for comp, steps in state["tech"].items():
        comp_rows = {}
        zdp_step = None
        for step in domain.TECH_LADDER:
            a, b = steps.get(step, [1.0, 1.0])
            p, n = beta_mean(a, b), beta_observations(a, b)
            mastered = n >= 1 and p >= domain.MASTERY_THRESHOLD
            status = "dominado" if mastered else ("en_proceso" if n > 0 else "pendiente")
            comp_rows[step] = {"p": round(p, 3), "n": n, "status": status}
            if zdp_step is None and not mastered:
                zdp_step = step
        overlay[comp] = {"name": domain.COMPONENTS[comp], "steps": comp_rows, "zdp_step": zdp_step or domain.TECH_LADDER[-1]}
    return overlay


def tech_unlocked(state: Dict[str, Any], comp: str, step: str) -> Tuple[bool, str]:
    """Un escalón está desbloqueado si es el primero, o si el anterior tiene ≥1 observación
    (o el estudiante ya lo dominó). Devuelve (desbloqueado, razón)."""
    idx = domain.TECH_LADDER.index(step)
    if idx == 0:
        return True, ""
    prev = domain.TECH_LADDER[idx - 1]
    a, b = state["tech"][comp].get(prev, [1.0, 1.0])
    if beta_observations(a, b) >= 1:
        return True, ""
    return False, f"Completa {prev.replace('-', ' · ')} de este componente para desbloquearlo"


# --------------------------------------------------------------------------- #
# Fase A: plan (reto, estrategia y tipo de andamiaje)
# --------------------------------------------------------------------------- #
def choose_challenge(state: Dict[str, Any], level_name: str, available: List[Dict[str, Any]]) -> Dict[str, Any]:
    """available: [{id, nivel, sub_nivel, componente_codigo}] del banco de retos.
    Elige el escalón de la ZDP técnica dentro del nivel, prefiriendo componentes no practicados."""
    prefix = {"Básico": "RB", "Medio": "RM", "Avanzado": "RA"}.get(level_name, "RB")
    done = set(state.get("challenges_done", []))
    candidates = [c for c in available if c["id"].startswith(prefix + "-")]
    if not candidates:
        return {"challenge_id": None, "reason": "No hay retos para este nivel.", "alternatives": []}

    scored = []
    for c in candidates:
        comp, step = domain.challenge_component(c["id"]), domain.challenge_step(c["id"])
        if not comp or not step or comp not in state["tech"]:
            continue
        a, b = state["tech"][comp][step]
        p, n = beta_mean(a, b), beta_observations(a, b)
        unlocked, _ = tech_unlocked(state, comp, step)
        comp_practiced = sum(beta_observations(*state["tech"][comp][s]) for s in domain.TECH_LADDER)
        mastered = n >= 1 and p >= domain.MASTERY_THRESHOLD
        # prioridad: desbloqueado > no dominado > escalón más bajo > componente menos practicado > no repetido
        key = (0 if unlocked else 1, 1 if mastered else 0, domain.TECH_LADDER.index(step), comp_practiced, 1 if c["id"] in done else 0)
        scored.append((key, c, p, unlocked))
    scored.sort(key=lambda t: t[0])
    best = scored[0]
    alternatives = [{"id": s[1]["id"], "p_dominio": round(s[2], 2), "unlocked": s[3]} for s in scored[1:4]]
    comp = domain.challenge_component(best[1]["id"])
    reason = (
        f"Es el escalón de tu zona de desarrollo próximo en «{domain.COMPONENTS.get(comp, comp)}»: "
        f"probabilidad de dominio {best[2]:.0%}. El tutor elige el escalón que aún no dominas, "
        f"dando prioridad a los componentes que menos has practicado."
    )
    return {"challenge_id": best[1]["id"], "reason": reason, "alternatives": alternatives, "p_dominio": round(best[2], 2)}


def strategy_profile(state: Dict[str, Any]) -> str:
    """Perfil de calibración con el que se eligen y se evalúan las estrategias: el del perfil
    dinámico (Kalman sobre todos los retos) en cuanto hay datos; antes, el del último reto."""
    prof = state.get("profile") or {}
    if (prof.get("bias") or {}).get("n", 0) > 0:
        return learner.calibration_class(prof)
    return state.get("last_profile") or "cal"


def choose_strategy(state: Dict[str, Any], group: str, rng: Optional[random.Random] = None) -> Dict[str, Any]:
    rng = rng or random.Random()
    profile = strategy_profile(state)
    if group == "control":
        sid = rng.choice(domain.STRATEGIES)
        return {"strategy_id": sid, "method": "aleatoria", "profile": profile,
                "reason": "Perteneces al grupo de comparación: la estrategia se asigna al azar.", "samples": {}}
    arms = {s: tuple(ab) for s, ab in state["strategies"][profile].items()}
    sid, samples = thompson_choose(arms, rng)
    a, b = arms[sid]
    cal = learner.summary(state.get("profile") or {})["calibration"]
    basis = (f"Tu perfil de calibración, estimado con tus {cal['n']} retos, es «{_profile_label(profile)}» "
             f"({cal['probs'][profile]:.0%} de probabilidad)" if cal["n"] > 0
             else f"Tu último perfil de calibración fue «{_profile_label(profile)}»")
    reason = (
        f"{basis}. Entre las estrategias que han reducido "
        f"el desfase en ese perfil, «{domain.STRATEGY_NAMES[sid]}» tiene la mejor estimación "
        f"({beta_mean(a, b):.0%} de éxito, {beta_observations(a, b, 2 if sid in domain.RECOMMENDED_BY_PROFILE.get(profile, []) else 1)} observaciones). "
        f"El muestreo de Thompson explora a veces otras alternativas para seguir aprendiendo."
    )
    return {"strategy_id": sid, "method": "thompson", "profile": profile, "reason": reason,
            "samples": {k: round(v, 3) for k, v in samples.items()}}


TRAIT_MESSAGES: Dict[str, str] = {
    "planificacion": "Antes de tocar nada: escribe en una línea qué vas a hacer primero.",
    "estimacion_tiempo": "Mira el reloj del reto: ¿vas al ritmo que estimaste?",
    "busqueda_ayuda": "Si un intento falla dos veces, pide la pista: pedir ayuda a tiempo también es estrategia.",
    "autonomia": "Intenta un paso más por tu cuenta antes de abrir la pista.",
    "control_impulsos": "Antes de verificar, revisa tu respuesta una vez: la prisa cuesta intentos.",
    "monitoreo": "A mitad del reto pregúntate: ¿sigo tan seguro/a como al inicio?",
    "uso_estrategia": "Usa tu estrategia antes de pedir ayuda: es tu primer recurso.",
    "foco": "Quédate en esta pestaña hasta terminar: cambiar de ventana corta el hilo.",
}


def scaffold_plan(zdp: str, prof: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Tipo de andamiaje según la ZDP (Griffin), ajustado con el perfil dinámico."""
    plan = _base_scaffold_plan(zdp)
    if not prof or not prof.get("n"):
        return {**plan, "personalized": [], "blocking_prior": domain.BLOCKING_PRIOR, "focus_trait": None}
    s = learner.summary(prof)
    traits, cal = s["traits"], s["calibration"]
    reasons: List[str] = []
    if not plan["mandatory_checkpoints"] and (cal["probs"]["over"] >= 0.6 or traits["monitoreo"]["status"] == "a_trabajar"):
        plan["mandatory_checkpoints"] = True
        reasons.append("puntos de control: tiendes a sobreestimar tu confianza" if cal["probs"]["over"] >= 0.6
                       else "puntos de control: aún cuesta ajustar la confianza mientras trabajas")
    if not plan["ask_before_hint"] and (traits["control_impulsos"]["status"] == "a_trabajar" or traits["autonomia"]["status"] == "a_trabajar"):
        plan["ask_before_hint"] = True
        reasons.append("te pediré nombrar el criterio antes de cada pista")
    weak = s["weakest_trait"]
    if weak and weak in TRAIT_MESSAGES:
        plan["messages"] = [TRAIT_MESSAGES[weak]] + plan["messages"]
        reasons.append(f"foco de trabajo: {learner.TRAITS_BY_ID[weak]['label'].lower()}")
    return {**plan, "personalized": reasons, "blocking_prior": s["blocking_prior"], "focus_trait": weak}


def _base_scaffold_plan(zdp: str) -> Dict[str, Any]:
    plans = {
        "basico": {
            "type": "conciencia",
            "mandatory_checkpoints": True,
            "ask_before_hint": False,
            "messages": ["Antes de ejecutar: ¿qué tan seguro/a estás de que funcionará?",
                         "Al terminar verás la diferencia entre tu confianza y tu resultado."],
        },
        "medio": {
            "type": "monitoreo",
            "mandatory_checkpoints": False,
            "ask_before_hint": True,
            "messages": ["Llevas dos errores. ¿Sigues tan seguro/a como al inicio?",
                         "¿Qué criterio te está bloqueando? Escríbelo antes de pedir la pista."],
        },
        "avanzado": {
            "type": "transferencia",
            "mandatory_checkpoints": False,
            "ask_before_hint": False,
            "messages": ["¿Qué estrategia de este reto usarías en un reto de otro componente?",
                         "Explícale a un compañero cómo verificaste tu solución."],
        },
    }
    return {"zdp": zdp, **plans[zdp]}


def plan_session(state: Dict[str, Any], level_name: str, available: List[Dict[str, Any]], group: str,
                 rng: Optional[random.Random] = None) -> Dict[str, Any]:
    loc = locate_zdp(state)
    challenge = choose_challenge(state, level_name, available)
    strategy = choose_strategy(state, group, rng)
    return {
        "group": group,
        "zdp": {k: v for k, v in loc.items() if k != "criteria"},
        "challenge": challenge,
        "strategy": strategy,
        "scaffold": scaffold_plan(loc["zdp"], state.get("profile")),
        "profile": learner.summary(state.get("profile") or {}),
        "overlay": tech_overlay(state),
    }


# --------------------------------------------------------------------------- #
# Fase B: andamiaje contingente (también se calcula en el cliente con los mismos parámetros)
# --------------------------------------------------------------------------- #
def scaffold_level(p_block: float, consecutive_high: int = 0) -> Optional[str]:
    if p_block >= 0.70:
        return "N3" if consecutive_high >= 2 else "N2"
    if p_block >= 0.55:
        return "N1"
    if p_block >= 0.40:
        return "N0"
    return None


def blocking(signals: Dict[str, bool]) -> float:
    full = {k: bool(signals.get(k, False)) for k in domain.BLOCKING_SIGNALS}
    return blocking_probability(full, domain.BLOCKING_SIGNALS, domain.BLOCKING_PRIOR)


# --------------------------------------------------------------------------- #
# Fase C: lectura del reto, actualización y retroalimentación
# --------------------------------------------------------------------------- #
def _profile_label(p: str) -> str:
    return {"over": "sobreconfianza", "sub": "subestimación", "cal": "calibrado"}.get(p, p)


READING_MEMORY: float = 0.4  # peso de la lectura anterior en el prior del reto siguiente


def reading_prior(history: List[Dict[str, Any]]) -> Optional[Dict[str, float]]:
    """Bayes secuencial: el prior de nivel mezcla el uniforme con la última lectura, para
    que un reto atípico no haga saltar al estudiante de nivel, sin quedar anclado al pasado."""
    if not history or not history[-1].get("posterior"):
        return None
    prev = history[-1]["posterior"]
    u = 1.0 / len(domain.LEVELS)
    return {lvl: (1 - READING_MEMORY) * u + READING_MEMORY * float(prev.get(lvl, u)) for lvl in domain.LEVELS}


def read_challenge(observations: Dict[str, Optional[bool]], prior: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
    lik = {i["id"]: i["p"] for i in domain.INDICATORS}
    post = naive_bayes_bernoulli(observations, lik, domain.LEVELS, prior)
    ranked = sorted(post, key=post.get, reverse=True)
    winner, runner = ranked[0], ranked[1]
    contrib = indicator_contributions(observations, lik, winner, runner)
    # Qué le falta para el nivel siguiente: indicadores en "no" con alta probabilidad en el nivel superior.
    missing = []
    if winner != "avanzado":
        nxt = domain.LEVELS[domain.LEVELS.index(winner) + 1]
        for ind_id, val in observations.items():
            if val is False and lik[ind_id][nxt] >= 0.6:
                missing.append(ind_id)
    return {
        "posterior": {k: round(v, 4) for k, v in post.items()},
        "level": winner,
        "level_label": domain.LEVEL_LABELS[winner],
        "contributions": [{"indicator": i, "weight": w, "text": domain.INDICATORS_BY_ID[i]["text"]} for i, w in contrib[:6]],
        "missing_for_next": [{"indicator": i, "text": domain.INDICATORS_BY_ID[i]["text"]} for i in missing],
    }


def process_phase_c(state: Dict[str, Any], obs: Dict[str, Any], calibration: Dict[str, Any],
                    challenge: Dict[str, Any], group: str, session_id: str) -> Dict[str, Any]:
    """Actualiza el estado con un reto terminado y produce la retroalimentación de desarrollo.

    obs: observaciones crudas (ver indicators.behavior_indicators / criterion_observations).
    calibration: salida de services.calibration.compute_calibration.
    challenge: {id, criterios: [...], titulo}.
    """
    state = ensure_state(state)
    before = locate_zdp(state)
    bias = calibration.get("bias_index")
    txt = text_indicators(obs.get("reflection_text") or "", obs.get("jg_m3_text") or "",
                          obs.get("jg_a3_text") or "", challenge.get("criterios") or [], challenge.get("titulo") or "")
    ind = behavior_indicators(obs)
    attempts = attempt_summary(obs)
    nb_obs: Dict[str, Optional[bool]] = {**ind, "f1": txt["f1"], "f2": txt["f2"], "f3": txt["f3"],
                                         "f4": txt["f4"] if obs.get("jg_m3_text") is not None else None}
    reading = read_challenge(nb_obs, reading_prior(state.get("history") or []))
    crit = criterion_observations(ind, txt, obs, bias)

    # 1) Beta-Bernoulli por criterio (+ fading: éxitos consecutivos sin ayuda)
    helped = int(obs.get("hint_count") or 0) > 0 or bool(obs.get("auto_hint_shown"))
    newly_mastered: List[str] = []
    for cid, value in crit.items():
        if value is None:
            continue
        a, b = state["criteria"][cid]
        was = is_mastered(a, b, domain.MASTERY_THRESHOLD, domain.MIN_OBSERVATIONS)
        a, b = beta_update(a, b, value)
        state["criteria"][cid] = [a, b]
        state["fading"][cid] = (state["fading"].get(cid, 0) + 1) if (value and not helped) else 0
        if not was and is_mastered(a, b, domain.MASTERY_THRESHOLD, domain.MIN_OBSERVATIONS):
            newly_mastered.append(cid)

    # 2) Escalón técnico. El desempeño esperado (P(dominio) antes del reto) mide qué tan difícil
    # era este escalón para el estudiante y sirve para ajustar el sesgo por dificultad.
    comp, step = domain.challenge_component(challenge["id"]), domain.challenge_step(challenge["id"])
    passed = bool(obs.get("passed"))
    expected_perf = None
    if comp in state["tech"] and step:
        a, b = state["tech"][comp][step]
        expected_perf = round(10 * beta_mean(a, b), 2)
        state["tech"][comp][step] = list(beta_update(a, b, passed))
    if challenge["id"] not in state["challenges_done"]:
        state["challenges_done"].append(challenge["id"])

    # Sesgo ajustado por dificultad: lo que se compara entre retos (Thompson y Kalman). Al estudiante
    # se le sigue mostrando el sesgo crudo de este reto (calibration), que es el honesto para él.
    offset = learner.difficulty_offset(expected_perf)
    bias_adj = round(bias - offset, 3) if bias is not None else None

    # 3) Thompson: la estrategia usada "tuvo éxito" si redujo el |sesgo ajustado| frente al reto
    # anterior, así un cambio de escalón (N1 tras fallar, N3 tras dominar) no se confunde con
    # una mejora del monitoreo. Se evalúa en el brazo del perfil con que se eligió.
    strategy_used = obs.get("strategy_id") or state.get("last_strategy")
    strategy_outcome = None
    prev_bias = state.get("last_bias")
    prev_adj = state.get("last_bias_adj", prev_bias)   # estados anteriores al ajuste: sesgo crudo
    prev_profile = strategy_profile(state) if prev_bias is not None else state.get("last_profile")
    if strategy_used in domain.STRATEGIES and prev_adj is not None and bias_adj is not None and prev_profile in state["strategies"] and group != "control":
        success = abs(bias_adj) < abs(prev_adj) - 0.25 or (abs(bias_adj) <= domain.CALIBRATED_BIAS and abs(prev_adj) <= domain.CALIBRATED_BIAS)
        a, b = state["strategies"][prev_profile][strategy_used]
        state["strategies"][prev_profile][strategy_used] = list(beta_update(a, b, success))
        strategy_outcome = {"strategy_id": strategy_used, "profile": prev_profile, "success": success,
                            "prev_bias": prev_bias, "bias": bias, "prev_bias_adj": prev_adj, "bias_adj": bias_adj,
                            "prev_step": state.get("last_step"), "step": step, "same_step": state.get("last_step") == step}
    profile = calibration.get("cluster") or "cal"
    state["last_bias"], state["last_strategy"], state["last_profile"] = bias, strategy_used, profile
    state["last_bias_adj"], state["last_step"] = bias_adj, step

    # 4) Perfil dinámico: calibración (Kalman sobre el sesgo ajustado), rasgos, bloqueo y ritmo
    state["profile"] = learner.update_profile(state.get("profile"), ind, obs, bias, attempts, offset)

    after = locate_zdp(state)
    feedback = development_feedback(before, after, crit, reading, newly_mastered)
    state["history"] = (state.get("history") or [])[-19:] + [{
        "session_id": session_id, "challenge_id": challenge["id"], "level": reading["level"],
        "posterior": reading["posterior"], "bias": bias, "score": obs.get("score"), "passed": passed,
        "step": step, "component": comp, "expected_perf": expected_perf, "difficulty_offset": round(offset, 3), "bias_adj": bias_adj,
        "at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "attempts": attempts.get("attempts"), "trial_and_error": attempts.get("trial_and_error"),
        "zdp": after["zdp"], "criteria": {k: v for k, v in crit.items() if v is not None},
    }]
    return {
        "state": state,
        "reading": reading,
        "indicators": {k: v for k, v in nb_obs.items()},
        "text_analysis": txt,
        "criteria_observed": crit,
        "newly_mastered": newly_mastered,
        "zdp_before": {k: v for k, v in before.items() if k != "criteria"},
        "zdp_after": {k: v for k, v in after.items() if k != "criteria"},
        "criteria": after["criteria"],
        "strategy_outcome": strategy_outcome,
        "attempts": attempts,
        "difficulty": {"step": step, "expected_perf": expected_perf, "offset": round(offset, 3), "bias": bias, "bias_adj": bias_adj},
        "profile": learner.summary(state["profile"]),
        "feedback": feedback,
        "overlay": tech_overlay(state),
    }


def development_feedback(before: Dict[str, Any], after: Dict[str, Any], crit: Dict[str, Optional[bool]],
                         reading: Dict[str, Any], newly_mastered: List[str]) -> Dict[str, Any]:
    """Mensaje con enfoque de desarrollo: «Ya logras ___. Tu siguiente paso es ___»."""
    achieved_now = [cid for cid, v in crit.items() if v]
    achieved_ids = sorted(achieved_now, key=lambda c: (domain.LEVELS.index(domain.CRITERIA_BY_ID[c]["level"]), c))
    achieved = domain.CRITERIA_BY_ID[achieved_ids[-1]]["achieved"] if achieved_ids else None
    pending = after["pending_criteria"]
    zdp_short = domain.LEVEL_LABELS[after["zdp"]].split(" · ")[0]
    # Siguiente paso: primer criterio pendiente de la ZDP que no se cumplió en este reto. Si en este
    # reto se cumplieron todos, el paso es consolidarlos (3 observaciones) y se nombra el primer
    # criterio del nivel siguiente que aún no aparece.
    not_now = [c for c in pending if crit.get(c) is not True]
    if not_now:
        next_ids = not_now
        next_step = domain.CRITERIA_BY_ID[next_ids[0]]["next_step"]
    else:
        nxt_level = domain.LEVELS[min(domain.LEVELS.index(after["zdp"]) + 1, len(domain.LEVELS) - 1)]
        upper = [c for c in domain.CRITERIA_BY_LEVEL[nxt_level] if crit.get(c) is not True] if nxt_level != after["zdp"] else []
        next_ids = upper or pending
        next_step = (
            f"repetirlo en los próximos retos para consolidar el nivel {zdp_short}"
            + (f" y, cuando puedas, {domain.CRITERIA_BY_ID[upper[0]]['next_step']}" if upper else "")
        ) if pending else None
    if achieved and next_step:
        msg = f"Ya logras {achieved}. Tu siguiente paso es {next_step}."
    elif achieved:
        msg = f"Ya logras {achieved}. Has consolidado la autorregulación: ahora solo te pediremos transferir tus estrategias a otros retos."
    elif next_step:
        msg = f"En este reto no se registró ningún criterio de la progresión. Tu siguiente paso es {next_step}."
    else:
        msg = "Sigue practicando: cada reto suma evidencia sobre cómo te regulas."
    level_change = None
    if before["zdp"] != after["zdp"]:
        level_change = f"Consolidaste el nivel {domain.LEVEL_LABELS[before['zdp']].split(' · ')[0]}: tu zona de desarrollo pasa a {after['zdp_label']}."
    return {
        "message": msg,
        "achieved_criterion": achieved_ids[-1] if achieved_ids else None,
        "next_criterion": next_ids[0] if next_ids else None,
        "newly_mastered": newly_mastered,
        "level_change": level_change,
        "reading_sentence": f"En este reto te comportaste como nivel {reading['level_label'].split(' · ')[0]} "
                            f"({reading['posterior'][reading['level']]:.0%} de probabilidad).",
    }


def _lower_first(s: str) -> str:
    return s[:1].lower() + s[1:] if s else s
