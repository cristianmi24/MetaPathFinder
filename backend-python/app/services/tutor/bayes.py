"""Herramientas bayesianas con variables de Bernoulli.

Todas funcionan sin datos históricos: los parámetros iniciales los fija el
experto (domain.py) y se actualizan con las observaciones del propio estudiante.
Son funciones puras para que las pruebas automatizadas reproduzcan los ejemplos
del documento de diseño.
"""
from __future__ import annotations

import math
import random
from typing import Dict, Iterable, List, Mapping, Optional, Tuple

# Las probabilidades de experto se acotan para que ningún indicador pueda
# anular por sí solo a un nivel (evita ceros y productos degenerados).
P_MIN, P_MAX = 0.02, 0.98


def _clip(p: float) -> float:
    return min(P_MAX, max(P_MIN, float(p)))


# --------------------------------------------------------------------------- #
# 1. Naive Bayes Bernoulli
# --------------------------------------------------------------------------- #
def naive_bayes_bernoulli(
    observations: Mapping[str, Optional[bool]],
    likelihoods: Mapping[str, Mapping[str, float]],
    classes: Iterable[str],
    priors: Optional[Mapping[str, float]] = None,
) -> Dict[str, float]:
    """P(clase | observaciones) ∝ P(clase) × Π P(obs | clase).

    observations: {indicador: True/False/None}. None = no observado (se omite).
    likelihoods: {indicador: {clase: P(indicador = sí | clase)}}.
    Devuelve probabilidades normalizadas por clase. Se calcula en log-espacio.
    """
    classes = list(classes)
    priors = priors or {c: 1.0 / len(classes) for c in classes}
    log_post: Dict[str, float] = {}
    for c in classes:
        total = math.log(max(priors.get(c, 1e-9), 1e-9))
        for ind, value in observations.items():
            if value is None or ind not in likelihoods:
                continue
            p_yes = _clip(likelihoods[ind][c])
            total += math.log(p_yes if value else 1.0 - p_yes)
        log_post[c] = total
    m = max(log_post.values())
    weights = {c: math.exp(v - m) for c, v in log_post.items()}
    z = sum(weights.values())
    return {c: w / z for c, w in weights.items()}


def indicator_contributions(
    observations: Mapping[str, Optional[bool]],
    likelihoods: Mapping[str, Mapping[str, float]],
    winner: str,
    runner_up: str,
) -> List[Tuple[str, float]]:
    """Peso (log-verosimilitud relativa) de cada indicador a favor de `winner`
    frente a `runner_up`. Sirve para explicar la decisión (XAI)."""
    out: List[Tuple[str, float]] = []
    for ind, value in observations.items():
        if value is None or ind not in likelihoods:
            continue
        pw = _clip(likelihoods[ind][winner])
        pr = _clip(likelihoods[ind][runner_up])
        if not value:
            pw, pr = 1 - pw, 1 - pr
        out.append((ind, round(math.log(pw / pr), 3)))
    out.sort(key=lambda t: -abs(t[1]))
    return out


# --------------------------------------------------------------------------- #
# 2. Beta-Bernoulli
# --------------------------------------------------------------------------- #
def beta_update(a: float, b: float, success: bool) -> Tuple[float, float]:
    return (a + 1.0, b) if success else (a, b + 1.0)


def beta_mean(a: float, b: float) -> float:
    return a / (a + b)


def beta_observations(a: float, b: float, prior_a: float = 1.0, prior_b: float = 1.0) -> int:
    return int(round((a - prior_a) + (b - prior_b)))


def beta_credible_interval(a: float, b: float, z: float = 1.0) -> Tuple[float, float]:
    """Intervalo aproximado media ± z·desviación (suficiente para la interfaz)."""
    m = beta_mean(a, b)
    var = (a * b) / ((a + b) ** 2 * (a + b + 1))
    s = math.sqrt(var)
    return (max(0.0, m - z * s), min(1.0, m + z * s))


def is_mastered(a: float, b: float, threshold: float, min_obs: int) -> bool:
    return beta_observations(a, b) >= min_obs and beta_mean(a, b) >= threshold


# --------------------------------------------------------------------------- #
# 3. Muestreo de Thompson
# --------------------------------------------------------------------------- #
def thompson_choose(arms: Mapping[str, Tuple[float, float]], rng: Optional[random.Random] = None) -> Tuple[str, Dict[str, float]]:
    """Toma una muestra Beta(a, b) por brazo y elige el mayor. Devuelve también
    las muestras para registrar la decisión."""
    rng = rng or random.Random()
    samples = {arm: rng.betavariate(a, b) for arm, (a, b) in arms.items()}
    best = max(samples, key=samples.get)
    return best, samples


# --------------------------------------------------------------------------- #
# 4. Probabilidad de bloqueo (Naive Bayes de dos clases)
# --------------------------------------------------------------------------- #
def blocking_probability(
    signals: Mapping[str, bool],
    signal_table: Mapping[str, Mapping[str, float]],
    prior: float,
) -> float:
    obs = {k: bool(v) for k, v in signals.items() if k in signal_table}
    lik = {k: {"blocked": v["blocked"], "flowing": v["flowing"]} for k, v in signal_table.items()}
    post = naive_bayes_bernoulli(obs, lik, ["blocked", "flowing"], {"blocked": prior, "flowing": 1 - prior})
    return post["blocked"]
