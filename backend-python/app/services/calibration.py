"""Cálculo de calibración metacognitiva.

Medidas (Schraw, 2009; Nelson, 1984; Brier, 1950) sobre una escala común 0-10:
- bias_index         = confianza media − desempeño medio (signo: + sobreconfianza, − subestimación)
- error_promedio     = exactitud absoluta = media |confianza_i − desempeño_i|
- calibracion        = 10 − error_promedio
- brier              = media ((confianza_i − desempeño_i) / 10)²
- discriminacion     = confianza media en ítems superados − confianza media en ítems no superados
- gamma              = correlación de Goodman-Kruskal entre confianza y desempeño (≥ 3 ítems con variación)
- time_calibration   = contraste entre minutos estimados y reales (JG-B2), separado de la confianza

Cambio respecto a la versión anterior: los JOL de tiempo y de número de intentos
ya no se promedian como "confianza" (miden planificación y esfuerzo, no certeza):
se reportan aparte. Para compatibilidad, si un JOL llega sin `kind` se trata como confianza.
"""
from __future__ import annotations

from itertools import combinations
from typing import Any, Dict, List, Optional

CAPACITY_MAP: dict[str, float] = {
    # JG-B3 options
    "nunca lo he hecho": 1,
    "he leído sobre ello": 3.3,
    "lo he practicado poco": 6.6,
    "lo domino": 10,
    # JG-M3 options
    "entender qué me piden": 2.5,
    "encontrar la información necesaria": 5,
    "organizar mis ideas": 7.5,
    "redactar o presentar el resultado": 10,
    # JG-A3 options
    "no tengo experiencia previa relevante": 1,
    "tengo algo de experiencia pero no estoy seguro/a de aplicarla": 3.3,
    "mi experiencia previa me da buena base": 6.6,
    "mi experiencia previa me prepara completamente": 10,
    # Legacy / generic
    "muy capaz": 10,
    "capaz": 8,
    "algo capaz": 6,
    "poco capaz": 4,
    "no muy capaz": 3,
    "no me siento capaz": 1,
    "no capaz": 0,
}

VALID_CAPACITY_VALUES = set(CAPACITY_MAP.keys())

# Bandas de calibración sobre la escala 0-10 (|sesgo|).
BAND_CALIBRATED = 1.0
BAND_SLIGHT = 2.0


def normalize_jol(jol: dict) -> float:
    jol_type = jol["tipo"]
    value = jol["valor"]

    if jol_type == "escala":
        confidence = float(value)
        if confidence > 10:
            confidence = confidence / 10.0
    elif jol_type == "tiempo":
        max_time = float(jol.get("tiempo_maximo") or 15)
        confidence = 10.0 - (float(value) / max_time) * 10.0
    elif jol_type == "capacidad":
        if isinstance(value, str):
            confidence = CAPACITY_MAP.get(value.lower().strip(), 5.0)
        else:
            confidence = float(value)
    else:
        raise ValueError(f"Unsupported JOL type: {jol_type}")

    return max(0.0, min(10.0, confidence))


def normalize_performance(value: float) -> float:
    if value > 10:
        return value / 10.0
    return value


def compute_predicted_confidence(jols: list[dict]) -> dict:
    confidences = [normalize_jol(j) for j in jols]
    average = sum(confidences) / len(confidences) if confidences else 0.0

    return {
        "confianzas_normalizadas": [round(c, 2) for c in confidences],
        "nivel_confianza_predicho": round(average, 2),
        "etiqueta": _classify_confidence(average),
    }


def _gamma(xs: List[float], ys: List[float]) -> Optional[float]:
    """Goodman-Kruskal gamma: (concordantes − discordantes) / (concordantes + discordantes)."""
    if len(xs) < 3:
        return None
    conc = disc = 0
    for (i, j) in combinations(range(len(xs)), 2):
        dx, dy = xs[i] - xs[j], ys[i] - ys[j]
        if dx == 0 or dy == 0:
            continue
        if (dx > 0) == (dy > 0):
            conc += 1
        else:
            disc += 1
    if conc + disc == 0:
        return None
    return round((conc - disc) / (conc + disc), 3)


def _band(bias: float) -> str:
    ab = abs(bias)
    if ab <= BAND_CALIBRATED:
        return "calibrado"
    if ab <= BAND_SLIGHT:
        return "leve"
    return "marcada"


def compute_calibration(
    jols: list[dict],
    actual_scores: list[float],
    estimated_minutes: Optional[float] = None,
    actual_minutes: Optional[float] = None,
) -> dict:
    if len(jols) != len(actual_scores):
        raise ValueError("JOLs and actual scores must have the same length")

    if not jols:
        return {
            "confianzas_normalizadas": [],
            "resultados_normalizados": [],
            "diferencias_por_item": [],
            "error_promedio": 0.0,
            "calibracion": 5.0,
            "bias_index": 0.0,
            "brier": None,
            "discriminacion": None,
            "gamma": None,
            "banda": "sin_datos",
            "cluster": "cal",
            "nivel": "Sin suficientes observaciones",
            "n_confianza": 0,
            "time_calibration": _time_calibration(estimated_minutes, actual_minutes),
        }

    # Solo los juicios de certeza cuentan como confianza; tiempo y esfuerzo se reportan aparte.
    conf_items = [(normalize_jol(j), normalize_performance(s)) for j, s in zip(jols, actual_scores)
                  if (j.get("kind") or "confianza") in ("confianza", "capacidad")]
    if not conf_items:  # compatibilidad: sesiones antiguas sin `kind`
        conf_items = [(normalize_jol(j), normalize_performance(s)) for j, s in zip(jols, actual_scores)]

    confidences = [c for c, _ in conf_items]
    performances = [p for _, p in conf_items]

    avg_c = sum(confidences) / len(confidences)
    avg_p = sum(performances) / len(performances)

    diffs = [abs(c - p) for c, p in zip(confidences, performances)]
    avg_error = sum(diffs) / len(diffs)
    brier = sum(((c - p) / 10.0) ** 2 for c, p in zip(confidences, performances)) / len(diffs)

    bias_index = round(avg_c - avg_p, 2)
    calibration = max(0.0, min(10.0, 10.0 - avg_error))

    passed_conf = [c for c, p in conf_items if p >= 6.0]
    failed_conf = [c for c, p in conf_items if p < 6.0]
    discrimination = (
        round(sum(passed_conf) / len(passed_conf) - sum(failed_conf) / len(failed_conf), 2)
        if passed_conf and failed_conf else None
    )

    if bias_index > BAND_SLIGHT:
        cluster = "over"
    elif bias_index < -BAND_SLIGHT:
        cluster = "sub"
    else:
        cluster = "cal"

    is_zero_attempt = (avg_c < 1.0 and avg_p < 1.0)
    nivel = _classify_calibration(calibration, bias_index, is_zero_attempt)

    return {
        "confianzas_normalizadas": [round(c, 2) for c in confidences],
        "resultados_normalizados": [round(p, 2) for p in performances],
        "diferencias_por_item": [round(d, 2) for d in diffs],
        "error_promedio": round(avg_error, 2),
        "bias_index": bias_index,
        "calibracion": round(calibration, 2),
        "brier": round(brier, 4),
        "discriminacion": discrimination,
        "gamma": _gamma(confidences, performances),
        "banda": _band(bias_index),
        "cluster": cluster,
        "nivel": nivel,
        "is_zero_attempt": is_zero_attempt,
        "n_confianza": len(confidences),
        "time_calibration": _time_calibration(estimated_minutes, actual_minutes),
    }


def _time_calibration(estimated: Optional[float], actual: Optional[float]) -> Optional[Dict[str, Any]]:
    if not estimated or estimated <= 0 or actual is None:
        return None
    ratio = actual / estimated
    deviation = (actual - estimated) / estimated
    if abs(deviation) <= 0.30:
        label = "Estimación de tiempo realista"
    elif deviation > 0:
        label = "Subestimaste el tiempo necesario"
    else:
        label = "Sobrestimaste el tiempo necesario"
    return {
        "estimated_minutes": round(estimated, 1),
        "actual_minutes": round(actual, 1),
        "ratio": round(ratio, 2),
        "deviation_pct": round(deviation * 100, 1),
        "within_tolerance": abs(deviation) <= 0.30,
        "label": label,
    }


def _classify_confidence(avg: float) -> str:
    if avg >= 9:
        return "Confianza muy alta"
    elif avg >= 7:
        return "Confianza alta"
    elif avg >= 5:
        return "Confianza media"
    elif avg >= 3:
        return "Confianza baja"
    return "Confianza muy baja"


def _classify_calibration(cal: float, bias: float, is_zero_attempt: bool = False) -> str:
    if is_zero_attempt:
        return "Reconocimiento de falta de dominio (Desempeño Nulo)"

    if bias > BAND_SLIGHT:
        return f"Sobreconfianza Marcada (Sesgo +{bias})"
    elif bias < -BAND_SLIGHT:
        return f"Subestimación Cognitiva (Sesgo {bias})"

    if cal >= 9:
        return "Excelente Calibración Metacognitiva"
    elif cal >= 7:
        return "Buena Calibración"
    elif cal >= 5:
        return "Calibración Regular"
    return "Baja Calibración Metacognitiva"
