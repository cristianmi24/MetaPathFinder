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


def normalize_jol(jol: dict) -> float:
    jol_type = jol["tipo"]
    value = jol["valor"]

    if jol_type == "escala":
        confidence = float(value)
        if confidence > 10:
            confidence = confidence / 10.0
    elif jol_type == "tiempo":
        max_time = float(jol.get("tiempo_maximo", 15))
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


def compute_calibration(
    jols: list[dict],
    actual_scores: list[float],
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
            "cluster": "cal",
            "nivel": "Sin suficientes observaciones",
        }

    confidences = [normalize_jol(j) for j in jols]
    performances = [normalize_performance(s) for s in actual_scores]

    avg_c = sum(confidences) / len(confidences)
    avg_p = sum(performances) / len(performances)

    diffs = [abs(c - p) for c, p in zip(confidences, performances)]
    avg_error = sum(diffs) / len(diffs)

    bias_index = round(avg_c - avg_p, 2)
    calibration = max(0.0, min(10.0, 10.0 - avg_error))

    # Cluster determination based on Bias Index
    if bias_index > 2.0:
        cluster = "over"
    elif bias_index < -2.0:
        cluster = "sub"
    else:
        cluster = "cal"

    # Edge case: zero performance and zero confidence (0,0)
    is_zero_attempt = (avg_c < 1.0 and avg_p < 1.0)
    nivel = _classify_calibration(calibration, bias_index, is_zero_attempt)

    return {
        "confianzas_normalizadas": [round(c, 2) for c in confidences],
        "resultados_normalizados": [round(p, 2) for p in performances],
        "diferencias_por_item": [round(d, 2) for d in diffs],
        "error_promedio": round(avg_error, 2),
        "bias_index": bias_index,
        "calibracion": round(calibration, 2),
        "cluster": cluster,
        "nivel": nivel,
        "is_zero_attempt": is_zero_attempt,
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

    if bias > 2.0:
        return f"Sobreconfianza Marcada (Sesgo +{bias})"
    elif bias < -2.0:
        return f"Subestimación Cognitiva (Sesgo {bias})"

    if cal >= 9:
        return "Excelente Calibración Metacognitiva"
    elif cal >= 7:
        return "Buena Calibración"
    elif cal >= 5:
        return "Calibración Regular"
    return "Baja Calibración Metacognitiva"
