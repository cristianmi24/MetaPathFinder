"""Convierte las métricas que captura MetaPathFinder en observaciones sí/no.

- e1–e9: indicadores de comportamiento (tiempos, pistas, confianza, estrategia).
- f1–f4: indicadores de texto, detectados con léxicos construidos a partir de los
  ejemplos ancla de la progresión (docs/TUTOR-GRIFFIN-BAYES.md). Se usa además
  una similitud de tokens con los ejemplos ancla para explicar la lectura.
- Devuelve también las observaciones por criterio (B1–A4) para Beta-Bernoulli.

`None` significa "no observable en este reto" y se omite del cálculo: por ejemplo,
si el estudiante no cometió errores no se puede juzgar si pidió ayuda a tiempo.
"""
from __future__ import annotations

import re
import unicodedata
from typing import Any, Dict, List, Optional

from . import domain

Observation = Optional[bool]


def _norm(text: str) -> str:
    text = unicodedata.normalize("NFD", (text or "").lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return re.sub(r"\s+", " ", text).strip()


def _tokens(text: str) -> List[str]:
    return [t for t in re.findall(r"[a-z0-9]{3,}", _norm(text)) if t not in STOPWORDS]


STOPWORDS = set("""
que como para por con sin una uno unos unas los las del las este esta esto ese esa eso
muy mas pero porque cuando donde entre sobre hacia desde hasta tambien solo tan mis tus sus
era fue ser estar hay habia tener tengo tiene creo pienso parte reto todo nada algo bien mal
""".split())

# --- Léxicos de los indicadores de texto (a partir de los ejemplos ancla) ------------------
F1_PATTERNS = [
    r"\bpens[eé] que\b", r"\bcre[ií]a\b", r"\bcre[ií] que\b", r"\bme fue (mejor|peor)\b",
    r"\b(m[aá]s|menos) de lo que\b", r"\bestaba (muy )?segur", r"\bme califiqu", r"\bpuse \d",
    r"\bsaqu[eé]\b", r"\bde lo que (pensaba|esperaba|cre[ií]a)\b", r"\bdiferencia\b",
    r"\bconfianza\b", r"\b(sobre|sub)estim", r"\bme di cuenta\b", r"\bno pude\b",
    r"\bmi predicci[oó]n\b", r"\bcalcul[eé] (bien|mal)\b", r"\besperaba\b",
]
F2_PATTERNS = [
    r"\bno le[ií]\b", r"\bsin leer\b", r"\bno revis", r"\bno verifiqu", r"\bno divid",
    r"\bpor no\b", r"\bme falt[oó]\b", r"\bdeb[ií] (haber )?", r"\bsi hubiera\b",
    r"\bprob(é|e|ar) al azar\b", r"\bensayo y error\b", r"\bno planifiqu", r"\bme apur",
    r"\bno prest[eé] atenci[oó]n\b", r"\bme distra", r"\bempec[eé] sin\b", r"\bno segu[ií] la estrategia\b",
    r"\bno (me )?organic", r"\bno us[eé] la estrategia\b", r"\brevisar (los|el) criterio",
    r"\bdividir\b", r"\bverificar\b", r"\bleer (bien|los criterios|la instrucci)",
    r"\bno entend[ií] (bien )?(la|el|los|las)\b", r"\bfalta de (atenci|revisi|pr[aá]ctica)",
    r"\bno me fij", r"\bme confund[ií]\b", r"\bno pens[eé] antes\b", r"\bmi estrategia\b",
]
F2_UNCONTROLLABLE = [
    r"\bmala suerte\b", r"\bdif[ií]cil y ya\b", r"\bel sistema (fall|estab)", r"\bla pregunta estaba mal\b",
    r"\bsoy (malo|mala|bruto|bruta)\b", r"\bno sirvo\b",
]
F3_PATTERNS = [
    r"\botro reto\b", r"\bpr[oó]xim[oa] (reto|vez|actividad)\b", r"\bsiguiente reto\b", r"\ben el reto de\b",
    r"\blo (voy a|puedo) usar\b", r"\b(me )?sirve para\b", r"\baplicar(ía|é|e|la|lo)?\b", r"\ben otras actividades\b",
    r"\bcualquier actividad\b", r"\bhar[ií]a lo mismo\b", r"\ben (arduino|sql|python|excel|programaci)",
    r"\btransferir\b", r"\ben otro (componente|tema|curso|ejercicio)\b", r"\btambi[eé]n (me )?servir",
    r"\bla pr[oó]xima\b", r"\botros retos\b", r"\bde ahora en adelante\b",
]
EXPERIENCE_PATTERNS = [
    r"\ben el reto de\b", r"\baprend[ií] a\b", r"\bcuando hice\b", r"\bla vez que\b", r"\bantes hice\b",
    r"\bya hice\b", r"\bme pas[oó] (algo )?parecido\b", r"\ben (la l[ií]nea|el reto|la actividad) (del|de)\b",
    r"\b(arduino|sql|python|excel|huerta|l[ií]nea del tiempo|presupuesto|biblioteca)\b",
]
CRITERION_REF = re.compile(r"\bcriterio\s*\d\b")

# Ejemplos ancla por nivel (reflexión de Fase C) para la similitud de tokens.
ANCHORS: Dict[str, List[str]] = {
    "sin_evidencia": ["No sé, me fue mal.", "Estuvo difícil y ya.", "Normal, nada que decir."],
    "basico": [
        "Pensé que me iba a ir bien porque puse 9 de confianza, pero saqué 4. Creía que sabía más de lo que sabía.",
        "Me di cuenta de que estaba muy seguro y al final no pude ordenar bien los hitos.",
        "Me califiqué bajito, pero me fue mejor de lo que pensaba.",
    ],
    "medio": [
        "La diferencia fue porque empecé sin leer bien los criterios. Si hubiera revisado el criterio 2 antes, no habría tenido tantos errores.",
        "Bajé mi confianza en el punto de control cuando vi que el ciclo no funcionaba, y pedí la pista cuando entendí que el problema era la condición.",
        "Me fue peor porque no dividí el problema como decía la estrategia; me puse a probar al azar.",
    ],
    "avanzado": [
        "Mi predicción fue casi exacta porque antes de empezar identifiqué que lo difícil era la consulta. Escribir qué esperaba de cada ejecución me ayudó, y lo voy a usar también en los retos de Arduino.",
        "Calculé bien el tiempo porque dividí el reto en tres partes. En el próximo reto haría lo mismo y revisaría los criterios antes de ejecutar.",
        "Sabía que podía fallar en la clasificación, así que verifiqué cada categoría antes de entregar. Esa forma de verificar sirve para cualquier actividad donde haya que organizar información.",
    ],
}


def _any(patterns: List[str], text: str) -> bool:
    t = _norm(text)
    return any(re.search(p, t) for p in patterns)


def anchor_similarity(text: str) -> Dict[str, float]:
    """Similitud de Jaccard (tokens) con los ejemplos ancla de cada nivel."""
    toks = set(_tokens(text))
    out: Dict[str, float] = {}
    for level, examples in ANCHORS.items():
        best = 0.0
        for ex in examples:
            ex_t = set(_tokens(ex))
            if not toks or not ex_t:
                continue
            best = max(best, len(toks & ex_t) / len(toks | ex_t))
        out[level] = round(best, 3)
    return out


def text_indicators(reflection: str, jg_m3: str, jg_a3: str, criteria_texts: List[str], title: str) -> Dict[str, Any]:
    reflection = reflection or ""
    words = len(_tokens(reflection)) + len([w for w in re.findall(r"\w+", reflection) if w.lower() in STOPWORDS])
    f1 = _any(F1_PATTERNS, reflection) if words >= 4 else False
    f2 = (_any(F2_PATTERNS, reflection) and not _any(F2_UNCONTROLLABLE, reflection)) if words >= 6 else False
    f3 = _any(F3_PATTERNS, reflection) if words >= 6 else False

    # f4: JG-M3 menciona un elemento específico del reto.
    m3_tokens = set(_tokens(jg_m3 or ""))
    domain_tokens = set(_tokens(" ".join(criteria_texts or []) + " " + (title or "")))
    overlap = len({t[:5] for t in m3_tokens} & {t[:5] for t in domain_tokens})
    m3_words = len(re.findall(r"\w+", jg_m3 or ""))
    f4 = bool(jg_m3) and (bool(CRITERION_REF.search(_norm(jg_m3))) or overlap >= 2 or m3_words >= 10)

    a3_words = len(re.findall(r"\w+", jg_a3 or ""))
    experience = bool(jg_a3) and a3_words >= 8 and _any(EXPERIENCE_PATTERNS, jg_a3)

    return {
        "f1": f1, "f2": f2, "f3": f3, "f4": f4,
        "experience_cited": experience,
        "reflection_words": words,
        "anchor_similarity": anchor_similarity(reflection),
    }


def behavior_indicators(obs: Dict[str, Any]) -> Dict[str, Observation]:
    """obs: diccionario crudo enviado por el frontend al cerrar la Fase C."""
    est = float(obs.get("estimated_minutes") or 0)
    real_s = float(obs.get("total_time_seconds") or 0)
    real = real_s / 60.0
    runs = int(obs.get("runs") or 0)
    errs = int(obs.get("err_count") or 0)
    hints = int(obs.get("hint_count") or 0)
    hint_after_error = obs.get("hint_requested_after_error")
    hint_before_third = obs.get("hint_requested_before_third_attempt")
    auto_hint = bool(obs.get("auto_hint_shown"))
    brake = bool(obs.get("reflexive_brake_triggered"))
    jol_ini = obs.get("jol_inicial")
    checkpoints = [float(c) for c in (obs.get("checkpoints") or []) if c is not None]
    passed = bool(obs.get("passed"))
    evid = obs.get("strategy_evidence") or {}
    evid_before_help = obs.get("strategy_evidence_before_help")
    time_before_edit = obs.get("time_before_first_edit")
    subtasks = int(obs.get("subtasks_created") or 0)
    tab_changes = int(obs.get("tab_changes") or 0)
    mouse_erratic = obs.get("mouse_erratic")

    ind: Dict[str, Observation] = {}
    ind["e1"] = (abs(real - est) <= domain.TIME_TOLERANCE * est) if est > 0 and real_s > 0 else None
    if errs == 0 and runs <= 1:
        ind["e2"] = None  # sin error no hay bloqueo al que reaccionar
    else:
        if hint_after_error is None:
            hint_after_error = hints > 0
        if hint_before_third is None:
            hint_before_third = hints > 0 and runs <= 3
        ind["e2"] = bool(hint_after_error and hint_before_third)
    ind["e3"] = not auto_hint
    ind["e4"] = not brake
    if jol_ini is None or not checkpoints:
        ind["e5"] = None
    else:
        last = checkpoints[-1]
        delta = last - float(jol_ini)
        # Dirección correcta: baja tras errores, sube tras avances (o se mantiene cuando aprobó sin errores).
        if errs >= 1 and not passed:
            ind["e5"] = delta < 0
        elif passed and errs == 0:
            ind["e5"] = delta >= 0
        else:
            ind["e5"] = (delta < 0) if errs >= 2 else (delta >= -0.5)
    has_evidence = any(v not in (None, "", 0, False, [], {}) for v in evid.values()) if isinstance(evid, dict) else bool(evid)
    ind["e6"] = bool(evid_before_help) if evid_before_help is not None else (has_evidence and hints == 0 and not auto_hint)
    ind["e7"] = (subtasks > 0) or (time_before_edit is not None and float(time_before_edit) >= 20)
    ind["e8"] = tab_changes == 0
    ind["e9"] = (not bool(mouse_erratic)) if mouse_erratic is not None else None
    return ind


def criterion_observations(ind: Dict[str, Observation], txt: Dict[str, Any], obs: Dict[str, Any], bias: Optional[float]) -> Dict[str, Observation]:
    """Observación de cada criterio de la progresión (cumplido / no cumplido / no observable)."""
    jol_raw = obs.get("jol_raw") or {}
    answered = {k for k, v in jol_raw.items() if v not in (None, "")}
    checkpoints = obs.get("checkpoints") or []
    checkpoints_requested = obs.get("checkpoints_requested")
    errs = int(obs.get("err_count") or 0)
    hints = int(obs.get("hint_count") or 0)
    auto_hint = bool(obs.get("auto_hint_shown"))
    attempts_after_hint = obs.get("attempts_after_hint")
    evid = obs.get("strategy_evidence") or {}
    has_evidence = any(v not in (None, "", 0, False, [], {}) for v in evid.values()) if isinstance(evid, dict) else bool(evid)

    crit: Dict[str, Observation] = {}
    conf_jols = [k for k in answered if re.match(r"JG-(B1|M1|A1|A2)$", k) or k.endswith("_esp_1") or k.endswith("_esp_2")]
    crit["B1"] = len(answered) >= 3 and len(conf_jols) >= 1
    if checkpoints_requested is False or (checkpoints_requested is None and not checkpoints and not obs.get("certainty_prompted")):
        crit["B2"] = None
    else:
        crit["B2"] = len(checkpoints) >= 1 or bool(obs.get("certainty_answered"))
    if hints == 0 and not auto_hint:
        crit["B3"] = None if errs > 0 else None
    else:
        crit["B3"] = (int(attempts_after_hint) >= 1) if attempts_after_hint is not None else True
    crit["B4"] = bool(txt.get("f1"))
    crit["M1"] = bool(txt.get("f4")) if obs.get("jg_m3_text") is not None else None
    crit["M2"] = ind.get("e5")
    crit["M3"] = None if ind.get("e2") is None else bool(ind["e2"] and ind.get("e4", True))
    crit["M4"] = bool(txt.get("f2"))
    crit["A1"] = (("JG-A1" in answered) and bool(txt.get("experience_cited"))) if obs.get("jg_a3_text") is not None else None
    crit["A2"] = bool(ind.get("e6"))
    crit["A3"] = bool(ind.get("e3") and has_evidence) if (errs > 0 or hints > 0 or auto_hint) else None
    crit["A4"] = (abs(bias) <= domain.CALIBRATED_BIAS and bool(txt.get("f3"))) if bias is not None else None
    return crit
