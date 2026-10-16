"""Perfil dinámico del estudiante (modelo del estudiante abierto y actualizado reto a reto).

Reúne en un solo lugar lo que el tutor sabe del estudiante y lo actualiza con cada
reto cerrado (Fase C). Todas las piezas son bayesianas y tienen **olvido**: lo
reciente pesa más que lo antiguo, porque el estudiante cambia (justo lo que el
tutor busca provocar).

1. Calibración — filtro de Kalman de una dimensión sobre el sesgo de confianza
   (confianza − desempeño, escala 0-10). Da media, incertidumbre y la
   probabilidad de cada perfil (sobreconfianza / calibrado / subestimación),
   en lugar de fiarse del sesgo de un solo reto. Además del sesgo del reto, se
   corrige con cada par (confianza, acierto) de los intentos con confianza, y se
   lleva un Brier por intento con olvido.
2. Rasgos de autorregulación — Beta-Bernoulli con olvido alimentada por los
   indicadores de conducta e1–e9 de cada reto (planificar, estimar el tiempo,
   pedir ayuda a tiempo, autonomía, control de la impulsividad, monitoreo,
   uso de la estrategia, foco).
3. Propensión a bloquearse — Beta-Bernoulli: ¿necesitó ayuda o no logró el reto?
   Su media es la probabilidad previa personal del Naive Bayes de bloqueo en
   vivo (antes era 0,20 para todos).
4. Ritmo — media con olvido del log(tiempo real / tiempo estimado).

Funciones puras sobre diccionarios JSON (se guardan en state["profile"]).
"""
from __future__ import annotations

import math
from typing import Any, Dict, List, Optional

from . import domain
from .bayes import beta_credible_interval, beta_mean

# --------------------------------------------------------------------------- #
# Parámetros (de experto; se recalibran con datos del piloto sin tocar el código)
# --------------------------------------------------------------------------- #
FORGET: float = 0.85             # factor de olvido por reto (≈ memoria efectiva de 6-7 retos)

# Kalman del sesgo: estado = sesgo "verdadero" del estudiante.
BIAS_PRIOR_MEAN: float = 0.0
BIAS_PRIOR_SD: float = 2.0       # antes de observar nada, el sesgo puede estar en ±4
BIAS_PROCESS_SD: float = 0.6     # cuánto puede cambiar el sesgo real entre un reto y otro
BIAS_OBS_SD: float = 1.5         # ruido de medir el sesgo con un solo reto
# Un par (confianza 1-10, acierto 0/1) de un intento da el sesgo c − 10·acierto: insesgado pero
# muy ruidoso (un acierto con confianza 8 vale −2; un fallo, +8). σ≈4 ≈ desviación de un Bernoulli
# en escala 0-10 más el ruido del deslizador; así 4 pares pesan como ~0,6 retos.
ATTEMPT_OBS_SD: float = 4.0

# Ajuste por dificultad (efecto difícil-fácil; Lichtenstein & Fischhoff, 1977; Juslin, 1994):
# la confianza se mueve menos que el desempeño (pendiente ≈ 0,5), así que en un escalón difícil
# el sesgo sube y en uno fácil baja aunque el monitoreo no cambie. Antes de mezclar sesgos de
# escalones distintos se descuenta lo que predice la dificultad:
#   desplazamiento = HARD_EASY_K · (EXPECTED_REF − desempeño esperado), escala 0-10
# donde el desempeño esperado es 10 · P(dominio) del escalón (Beta técnica, antes del reto).
# HARD_EASY_K = 1 − pendiente; con los datos del piloto se estima por regresión sesgo ~ esperado.
HARD_EASY_K: float = 0.5
EXPECTED_REF: float = 5.0
BIAS_BAND: float = domain.CALIBRATED_BIAS   # |sesgo| ≤ 1,5 = calibrado

# Propensión a bloquearse: prior Beta(2, 8) → media 0,20 (el prior de experto).
BLOCK_PRIOR = (2.0, 8.0)
BLOCK_PRIOR_MIN, BLOCK_PRIOR_MAX = 0.08, 0.50   # el prior personal nunca anula las señales

# Rasgos: indicador de conducta → rasgo del perfil.
TRAITS: List[Dict[str, str]] = [
    {"id": "planificacion", "indicator": "e7", "label": "Planifica antes de actuar"},
    {"id": "estimacion_tiempo", "indicator": "e1", "label": "Estima bien el tiempo"},
    {"id": "busqueda_ayuda", "indicator": "e2", "label": "Pide ayuda a tiempo"},
    {"id": "autonomia", "indicator": "e3", "label": "Resuelve sin ayuda automática"},
    {"id": "control_impulsos", "indicator": "e4", "label": "Controla la impulsividad"},
    {"id": "monitoreo", "indicator": "e5", "label": "Ajusta su confianza mientras trabaja"},
    {"id": "uso_estrategia", "indicator": "e6", "label": "Aplica su estrategia antes de pedir ayuda"},
    {"id": "foco", "indicator": "e8", "label": "Mantiene el foco (sin cambiar de pestaña)"},
]
TRAITS_BY_ID = {t["id"]: t for t in TRAITS}
TRAIT_LOW: float = 0.45          # por debajo, el rasgo se trabaja con andamiaje dirigido
TRAIT_HIGH: float = 0.70


# --------------------------------------------------------------------------- #
# Estado
# --------------------------------------------------------------------------- #
def new_profile() -> Dict[str, Any]:
    return {
        "version": 1,
        "n": 0,
        "bias": {"mean": BIAS_PRIOR_MEAN, "var": BIAS_PRIOR_SD ** 2, "n": 0},
        "traits": {t["id"]: [1.0, 1.0] for t in TRAITS},
        "blocking": list(BLOCK_PRIOR),
        "pace": {"log_ratio": 0.0, "w": 0.0},
        "attempt_brier": {"mean": None, "w": 0.0},
        "help": {"abuse": 0.0, "avoidance": 0.0, "w": 0.0},
    }


def ensure_profile(p: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    base = new_profile()
    if not p:
        return base
    for k, v in p.items():
        if isinstance(v, dict) and isinstance(base.get(k), dict):
            base[k].update(v)
        else:
            base[k] = v
    for t in TRAITS:
        base["traits"].setdefault(t["id"], [1.0, 1.0])
    return base


# --------------------------------------------------------------------------- #
# Piezas bayesianas
# --------------------------------------------------------------------------- #
def kalman_predict(bias: Dict[str, float]) -> Dict[str, float]:
    """El sesgo real deriva entre un reto y otro (una vez por reto, no por intento)."""
    return {**bias, "var": float(bias["var"]) + BIAS_PROCESS_SD ** 2}


def kalman_correct(bias: Dict[str, float], observed: float, obs_sd: float = BIAS_OBS_SD) -> Dict[str, float]:
    mean, var = float(bias["mean"]), float(bias["var"])
    k = var / (var + obs_sd ** 2)
    return {"mean": mean + k * (observed - mean), "var": (1 - k) * var, "n": int(bias.get("n", 0)) + 1}


def kalman_bias(bias: Dict[str, float], observed: float) -> Dict[str, float]:
    """Predicción (el sesgo real deriva) + corrección con el sesgo observado en el reto."""
    return kalman_correct(kalman_predict(bias), observed)


def difficulty_offset(expected_perf: Optional[float]) -> float:
    """Sesgo que se espera solo por la dificultad del escalón (positivo si es difícil para el estudiante)."""
    if expected_perf is None:
        return 0.0
    return HARD_EASY_K * (EXPECTED_REF - float(expected_perf))


def attempt_pair_bias(confidence: float, correct: bool) -> float:
    """Sesgo de un intento en la escala 0-10: confianza − desempeño (10 si acertó, 0 si no)."""
    return float(confidence) - (10.0 if correct else 0.0)


def _norm_cdf(x: float) -> float:
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


def bias_profile_probs(bias: Dict[str, float]) -> Dict[str, float]:
    """P(sobreconfianza), P(calibrado), P(subestimación) bajo la normal posterior."""
    m, s = float(bias["mean"]), math.sqrt(max(float(bias["var"]), 1e-9))
    p_over = 1 - _norm_cdf((BIAS_BAND - m) / s)
    p_sub = _norm_cdf((-BIAS_BAND - m) / s)
    return {"over": p_over, "cal": max(0.0, 1 - p_over - p_sub), "sub": p_sub}


def forget_beta(a: float, b: float, lam: float = FORGET) -> List[float]:
    """Acerca la Beta al prior uniforme: las evidencias antiguas pierden peso."""
    return [1.0 + lam * (a - 1.0), 1.0 + lam * (b - 1.0)]


def forget_beta_to(a: float, b: float, prior: tuple, lam: float = FORGET) -> List[float]:
    return [prior[0] + lam * (a - prior[0]), prior[1] + lam * (b - prior[1])]


def was_blocked(obs: Dict[str, Any]) -> bool:
    """Un reto "bloqueó" al estudiante si necesitó ayuda, se replanificó o no lo logró."""
    return (int(obs.get("hint_count") or 0) > 0 or bool(obs.get("auto_hint_shown"))
            or bool(obs.get("replan_choice")) or any(l in ("N2", "N3") for l in (obs.get("scaffold_levels_shown") or []))
            or not bool(obs.get("passed")))


# --------------------------------------------------------------------------- #
# Actualización por reto
# --------------------------------------------------------------------------- #
def help_seeking_observation(e2: Optional[bool], attempts: Optional[Dict[str, Any]]) -> Optional[bool]:
    """Rasgo busqueda_ayuda: abuso o evitación de la ayuda lo niegan; si no, decide e2."""
    if attempts and (attempts.get("help_abuse") or attempts.get("help_avoidance")):
        return False
    return e2


def update_profile(profile: Dict[str, Any], indicators: Dict[str, Optional[bool]], obs: Dict[str, Any],
                   bias: Optional[float], attempts: Optional[Dict[str, Any]] = None,
                   offset: float = 0.0) -> Dict[str, Any]:
    """attempts: salida de indicators.attempt_summary (pares de confianza, Brier, abuso/evitación).
    offset: difficulty_offset del escalón; el Kalman observa sesgos ajustados por dificultad, así
    un N1 tras un fallo y un N3 tras dominar son comparables."""
    p = ensure_profile(profile)
    p["n"] = int(p.get("n", 0)) + 1
    attempts = attempts or {}
    pairs = attempts.get("confidence_pairs") or []

    if bias is not None or pairs:
        b = kalman_predict(p["bias"])
        if bias is not None:
            b = kalman_correct(b, float(bias) - offset)
        for conf, ok in pairs:
            b = kalman_correct(b, attempt_pair_bias(conf, ok) - offset, ATTEMPT_OBS_SD)
        p["bias"] = b

    if attempts.get("brier_attempts") is not None:
        ab = p["attempt_brier"]
        w = FORGET * float(ab["w"]) + 1
        prev = float(ab["mean"]) if ab["mean"] is not None else 0.0
        ab["mean"] = round((FORGET * float(ab["w"]) * prev + float(attempts["brier_attempts"])) / w, 4)
        ab["w"] = round(w, 4)

    if attempts.get("help_abuse") is not None or attempts.get("help_avoidance") is not None:
        h = p["help"]
        h["abuse"] = round(FORGET * float(h["abuse"]) + (1 if attempts.get("help_abuse") else 0), 4)
        h["avoidance"] = round(FORGET * float(h["avoidance"]) + (1 if attempts.get("help_avoidance") else 0), 4)
        h["w"] = round(FORGET * float(h["w"]) + 1, 4)

    for t in TRAITS:
        a, b = forget_beta(*p["traits"][t["id"]])
        val = indicators.get(t["indicator"])
        if t["id"] == "busqueda_ayuda":
            val = help_seeking_observation(val, attempts)
        if val is not None:
            a, b = (a + 1, b) if val else (a, b + 1)
        p["traits"][t["id"]] = [round(a, 4), round(b, 4)]

    a, b = forget_beta_to(*p["blocking"], BLOCK_PRIOR)
    a, b = (a + 1, b) if was_blocked(obs) else (a, b + 1)
    p["blocking"] = [round(a, 4), round(b, 4)]

    est = float(obs.get("estimated_minutes") or 0)
    real = float(obs.get("total_time_seconds") or 0) / 60
    if est > 0 and real > 0:
        pace = p["pace"]
        w = FORGET * float(pace["w"]) + 1
        pace["log_ratio"] = (FORGET * float(pace["w"]) * float(pace["log_ratio"]) + math.log(real / est)) / w
        pace["w"] = w
    return p


# --------------------------------------------------------------------------- #
# Lectura del perfil (lo que consumen las decisiones y la interfaz)
# --------------------------------------------------------------------------- #
def blocking_prior(profile: Dict[str, Any]) -> float:
    a, b = ensure_profile(profile)["blocking"]
    return min(BLOCK_PRIOR_MAX, max(BLOCK_PRIOR_MIN, beta_mean(a, b)))


def calibration_class(profile: Dict[str, Any]) -> str:
    probs = bias_profile_probs(ensure_profile(profile)["bias"])
    return max(probs, key=probs.get)


def trait_summary(profile: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    p = ensure_profile(profile)
    out = {}
    for t in TRAITS:
        a, b = p["traits"][t["id"]]
        lo, hi = beta_credible_interval(a, b)
        n = (a - 1) + (b - 1)
        mean = beta_mean(a, b)
        out[t["id"]] = {"label": t["label"], "p": round(mean, 3), "ci": [round(lo, 3), round(hi, 3)],
                        "evidence": round(n, 2),
                        "status": "sin_datos" if n < 0.9 else "fortaleza" if mean >= TRAIT_HIGH else "a_trabajar" if mean < TRAIT_LOW else "en_desarrollo"}
    return out


def weakest_trait(profile: Dict[str, Any]) -> Optional[str]:
    rows = [(k, v) for k, v in trait_summary(profile).items() if v["status"] == "a_trabajar"]
    if not rows:
        return None
    return min(rows, key=lambda kv: kv[1]["p"])[0]


def summary(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Vista del perfil para la interfaz y para registrar decisiones (XAI)."""
    p = ensure_profile(profile)
    probs = bias_profile_probs(p["bias"])
    pace = p["pace"]
    ratio = math.exp(pace["log_ratio"]) if pace["w"] > 0 else None
    return {
        "challenges": p["n"],
        "calibration": {
            "bias_mean": round(p["bias"]["mean"], 2),
            "bias_sd": round(math.sqrt(p["bias"]["var"]), 2),
            "n": p["bias"]["n"],
            "probs": {k: round(v, 3) for k, v in probs.items()},
            "class": max(probs, key=probs.get),
        },
        "traits": trait_summary(p),
        "weakest_trait": weakest_trait(p),
        "blocking_prior": round(blocking_prior(p), 3),
        "pace_ratio": round(ratio, 2) if ratio else None,
        "attempt_brier": p["attempt_brier"]["mean"],
        # Proporción (con olvido) de retos con abuso / evitación de la ayuda.
        "help_patterns": {k: round(p["help"][k] / p["help"]["w"], 3) if p["help"]["w"] > 0 else None
                          for k in ("abuse", "avoidance")},
    }
