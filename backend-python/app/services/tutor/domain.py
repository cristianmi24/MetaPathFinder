"""Módulo de Dominio: base de conocimiento fijada por el experto.

Contiene las dos progresiones de desarrollo (Griffin, 2018), el catálogo de
indicadores de Bernoulli y las probabilidades por nivel. No calcula nada:
los demás módulos lo consultan. Todos los valores son hipótesis iniciales que
deben validarse con docentes (juicio de expertos → kappa de Cohen → Rasch).
"""
from __future__ import annotations

from typing import Dict, List, TypedDict

LEVELS: List[str] = ["basico", "medio", "avanzado"]
LEVEL_LABELS: Dict[str, str] = {
    "basico": "Básico · Conciencia",
    "medio": "Medio · Monitoreo y control",
    "avanzado": "Avanzado · Autorregulación y transferencia",
}

# Componentes MEN (Tecnología e Informática) y escalera técnica de 9 escalones.
COMPONENTS: Dict[str, str] = {
    "C1": "Naturaleza y evolución",
    "C2": "Apropiación y uso",
    "C3": "Solución de problemas",
    "C4": "Tecnología y sociedad",
}
TECH_LADDER: List[str] = [
    "RB-N1", "RB-N2", "RB-N3",
    "RM-N1", "RM-N2", "RM-N3",
    "RA-N1", "RA-N2", "RA-N3",
]


def challenge_step(challenge_id: str) -> str | None:
    """'RM-C3-N2' → 'RM-N2' (escalón técnico independiente del componente)."""
    parts = (challenge_id or "").split("-")
    if len(parts) != 3:
        return None
    return f"{parts[0]}-{parts[2]}"


def challenge_component(challenge_id: str) -> str | None:
    parts = (challenge_id or "").split("-")
    return parts[1] if len(parts) == 3 else None


class Criterion(TypedDict):
    id: str
    level: str
    dimension: str
    phase: str
    text: str
    evidence: str
    next_step: str  # "Tu siguiente paso es ___" (enfoque de desarrollo)
    achieved: str   # "Ya logras ___" (segunda persona)


# Progresión metacognitiva: 4 dimensiones × 3 niveles = 12 criterios de calidad.
CRITERIA: List[Criterion] = [
    # D1 · Planificación y predicción (Fase A)
    {"id": "B1", "level": "basico", "dimension": "D1", "phase": "A",
     "text": "Emite un juicio de confianza y una estimación de tiempo antes de iniciar el reto.",
     "evidence": "Respondió JG-B1 (confianza) y JG-B2 (tiempo estimado).",
     "next_step": "antes de empezar, decir qué tan seguro/a estás y cuántos minutos te tomará",
     "achieved": "decir, antes de empezar, qué tan seguro/a estás y cuánto tiempo te tomará"},
    {"id": "M1", "level": "medio", "dimension": "D1", "phase": "A",
     "text": "Identifica la parte del reto que le resultará difícil y la relaciona con un criterio concreto.",
     "evidence": "El texto de JG-M3 menciona un elemento específico del reto o de sus criterios.",
     "next_step": "señalar, antes de empezar, qué criterio concreto del reto te costará más",
     "achieved": "señalar antes de empezar qué parte concreta del reto te costará"},
    {"id": "A1", "level": "avanzado", "dimension": "D1", "phase": "A",
     "text": "Predice qué criterios cumplirá y justifica la predicción con una experiencia previa concreta.",
     "evidence": "Respondió JG-A1 y el texto de JG-A3 cita una experiencia previa concreta.",
     "next_step": "predecir qué criterios cumplirás apoyándote en un reto anterior concreto",
     "achieved": "predecir qué criterios cumplirás apoyándote en una experiencia previa concreta"},
    # D2 · Monitoreo durante la tarea (Fase B)
    {"id": "B2", "level": "basico", "dimension": "D2", "phase": "B",
     "text": "Responde los puntos de control de confianza cuando el sistema se los solicita.",
     "evidence": "Registró la confianza en al menos un punto de control solicitado.",
     "next_step": "responder los puntos de control de confianza durante el reto",
     "achieved": "responder los puntos de control de confianza durante el reto"},
    {"id": "M2", "level": "medio", "dimension": "D2", "phase": "B",
     "text": "Modifica su juicio de confianza durante el reto de acuerdo con lo que observa.",
     "evidence": "La confianza del punto de control cambia en la dirección de lo ocurrido.",
     "next_step": "durante el reto, revisar si sigues tan seguro/a como al inicio y ajustar tu confianza",
     "achieved": "ajustar tu confianza durante el reto según lo que observas"},
    {"id": "A2", "level": "avanzado", "dimension": "D2", "phase": "B",
     "text": "Detecta por iniciativa propia que su plan no funciona y lo cambia antes de que el sistema intervenga.",
     "evidence": "Registró evidencias de estrategia antes de cualquier pista o alerta del sistema.",
     "next_step": "cambiar tu plan por iniciativa propia antes de que el tutor intervenga",
     "achieved": "cambiar tu plan por iniciativa propia antes de que el tutor intervenga"},
    # D3 · Control y búsqueda de ayuda (Fase B)
    {"id": "B3", "level": "basico", "dimension": "D3", "phase": "B",
     "text": "Utiliza la ayuda que el sistema le ofrece para continuar con el reto.",
     "evidence": "Tras abrir una pista o recibir la pista automática, realizó un nuevo intento.",
     "next_step": "usar la pista que el tutor te ofrece y volver a intentarlo",
     "achieved": "usar la ayuda que te ofrece el tutor para seguir adelante"},
    {"id": "M3", "level": "medio", "dimension": "D3", "phase": "B",
     "text": "Solicita ayuda cuando identifica un bloqueo concreto, en lugar de avanzar por ensayo y error.",
     "evidence": "Pidió la pista tras un error y antes de acumular intentos fallidos; sin freno metacognitivo.",
     "next_step": "pedir la pista justo cuando identifiques un bloqueo, en vez de probar al azar",
     "achieved": "pedir ayuda justo cuando identificas un bloqueo, sin probar al azar"},
    {"id": "A3", "level": "avanzado", "dimension": "D3", "phase": "B",
     "text": "Resuelve los bloqueos aplicando la estrategia asignada y usa la ayuda solo para verificar.",
     "evidence": "Completó el reto sin la pista automática y con evidencias de la estrategia asignada.",
     "next_step": "resolver los bloqueos con tu estrategia y usar la ayuda solo para verificar",
     "achieved": "resolver los bloqueos con tu estrategia y usar la ayuda solo para verificar"},
    # D4 · Evaluación y calibración (Fase C)
    {"id": "B4", "level": "basico", "dimension": "D4", "phase": "C",
     "text": "Reconoce, al ver su resultado, la diferencia entre lo que creía y lo que logró.",
     "evidence": "La reflexión nombra la diferencia entre confianza y resultado.",
     "next_step": "al ver tu resultado, nombrar la diferencia entre lo que creías y lo que lograste",
     "achieved": "reconocer la diferencia entre lo que creías y lo que lograste"},
    {"id": "M4", "level": "medio", "dimension": "D4", "phase": "C",
     "text": "Explica la causa de esa diferencia atribuyéndola a factores que puede controlar.",
     "evidence": "La reflexión atribuye el resultado a una causa controlable (estrategia, atención, revisión).",
     "next_step": "explicar la diferencia con una causa que puedas controlar (leer, dividir, revisar)",
     "achieved": "explicar esa diferencia con una causa que puedes controlar"},
    {"id": "A4", "level": "avanzado", "dimension": "D4", "phase": "C",
     "text": "Su predicción coincide con su desempeño y explica qué estrategia transferiría a otro reto.",
     "evidence": "Sesgo de calibración dentro de ±1,5 y reflexión que menciona transferencia.",
     "next_step": "lograr que tu predicción coincida con tu resultado y decir qué estrategia usarías en otro reto",
     "achieved": "predecir tu resultado con precisión y explicar qué estrategia transferirías"},
]
CRITERIA_BY_ID: Dict[str, Criterion] = {c["id"]: c for c in CRITERIA}
CRITERIA_BY_LEVEL: Dict[str, List[str]] = {
    lvl: [c["id"] for c in CRITERIA if c["level"] == lvl] for lvl in LEVELS
}
DIMENSIONS: Dict[str, str] = {
    "D1": "Planificación y predicción",
    "D2": "Monitoreo durante la tarea",
    "D3": "Control y búsqueda de ayuda",
    "D4": "Evaluación y calibración",
}


class Indicator(TypedDict):
    id: str
    text: str
    source: str
    criteria: List[str]
    p: Dict[str, float]  # P(indicador = sí | nivel)


# Catálogo de indicadores de Bernoulli y probabilidades de experto por nivel.
# Un indicador con valores parecidos en los tres niveles (e9) es evidencia débil a propósito.
INDICATORS: List[Indicator] = [
    {"id": "e1", "text": "El tiempo real quedó dentro de ±30 % del tiempo estimado.",
     "source": "total_time vs. JG-B2", "criteria": ["A1", "A4"],
     "p": {"basico": 0.30, "medio": 0.50, "avanzado": 0.80}},
    {"id": "e2", "text": "Pidió la pista después de un error y antes del tercer intento.",
     "source": "hintCount, errCount, runs", "criteria": ["M3"],
     "p": {"basico": 0.20, "medio": 0.70, "avanzado": 0.40}},
    {"id": "e3", "text": "Terminó sin necesitar la pista automática.",
     "source": "showHint", "criteria": ["A3"],
     "p": {"basico": 0.30, "medio": 0.55, "avanzado": 0.85}},
    {"id": "e4", "text": "No se activó el freno metacognitivo.",
     "source": "is_reflexive_brake", "criteria": ["M3"],
     "p": {"basico": 0.60, "medio": 0.80, "avanzado": 0.90}},
    {"id": "e5", "text": "Su confianza en el punto de control cambió en la dirección correcta.",
     "source": "jolInicial vs. jolMedioActividad", "criteria": ["M2"],
     "p": {"basico": 0.20, "medio": 0.75, "avanzado": 0.85}},
    {"id": "e6", "text": "Registró la estrategia antes de cualquier pista o alerta.",
     "source": "evidencias_estrategia", "criteria": ["A2"],
     "p": {"basico": 0.15, "medio": 0.45, "avanzado": 0.80}},
    {"id": "e7", "text": "Planificó antes de la primera edición (subtareas o pausa de lectura).",
     "source": "timeBeforeFirstEdit, subtasksCreated", "criteria": ["M1", "A2"],
     "p": {"basico": 0.25, "medio": 0.55, "avanzado": 0.75}},
    {"id": "e8", "text": "No cambió de pestaña durante el reto.",
     "source": "visibility_change", "criteria": [],
     "p": {"basico": 0.60, "medio": 0.75, "avanzado": 0.80}},
    {"id": "e9", "text": "El ratón no mostró un patrón errático.",
     "source": "mouse_distance", "criteria": [],
     "p": {"basico": 0.55, "medio": 0.60, "avanzado": 0.65}},
    {"id": "f1", "text": "La reflexión nombra la diferencia entre lo que creía y lo que logró.",
     "source": "reflection_text", "criteria": ["B4"],
     "p": {"basico": 0.70, "medio": 0.90, "avanzado": 0.90}},
    {"id": "f2", "text": "La reflexión atribuye el resultado a una causa controlable.",
     "source": "reflection_text", "criteria": ["M4"],
     "p": {"basico": 0.20, "medio": 0.85, "avanzado": 0.85}},
    {"id": "f3", "text": "La reflexión menciona transferencia a otro reto.",
     "source": "reflection_text", "criteria": ["A4"],
     "p": {"basico": 0.05, "medio": 0.15, "avanzado": 0.80}},
    {"id": "f4", "text": "El texto de JG-M3 menciona un elemento específico del reto.",
     "source": "Respuesta JG-M3", "criteria": ["M1"],
     "p": {"basico": 0.20, "medio": 0.80, "avanzado": 0.85}},
]
INDICATORS_BY_ID: Dict[str, Indicator] = {i["id"]: i for i in INDICATORS}

# Señales de bloqueo en tiempo real (Fase B). Prior P(bloqueado) = 0.20.
BLOCKING_PRIOR: float = 0.20
BLOCKING_SIGNALS: Dict[str, Dict[str, float]] = {
    # señal: {P(señal|bloqueado), P(señal|avanzando)}
    "errores_seguidos": {"blocked": 0.80, "flowing": 0.20},
    "pausa_larga": {"blocked": 0.70, "flowing": 0.30},
    "ediciones_sin_exito": {"blocked": 0.60, "flowing": 0.30},
    "cambio_pestana": {"blocked": 0.40, "flowing": 0.15},
}

# Escalera de andamiaje contingente (Wood, Bruner y Ross, 1976).
SCAFFOLD_LADDER = [
    {"level": "N0", "name": "Metacognitiva", "min_p": 0.40, "max_p": 0.55,
     "tactic": "pregunta_socratica"},
    {"level": "N1", "name": "Orientación", "min_p": 0.55, "max_p": 0.70,
     "tactic": "senalamiento"},
    {"level": "N2", "name": "Estratégica", "min_p": 0.70, "max_p": 1.01,
     "tactic": "recordatorio_estrategia"},
    {"level": "N3", "name": "Paso parcial", "min_p": 0.70, "max_p": 1.01,
     "tactic": "ejemplo_resuelto", "requires_consecutive": 2},
    {"level": "N4", "name": "Solución explicada", "min_p": 1.01, "max_p": 1.01,
     "tactic": "solucion_guiada", "on_request_only": True},
]

# Tácticas didácticas formalizadas (subconjunto de las 19 de Caro, 2015) y su etiqueta visible.
TACTICS: Dict[str, str] = {
    "pregunta_socratica": "Pregunta socrática",
    "senalamiento": "Señalamiento del error",
    "recordatorio_estrategia": "Recordatorio de estrategia",
    "ejemplo_resuelto": "Desglose paso a paso",
    "solucion_guiada": "Solución análoga guiada",
    "analogia": "Analogía cotidiana",
    "contraejemplo": "Contraejemplo",
    "simulacion": "Simulación / versión simplificada",
}

# Umbrales de decisión (hipótesis iniciales; ver docs/TUTOR-GRIFFIN-BAYES.md).
MASTERY_THRESHOLD: float = 0.70     # P(domina criterio) para considerarlo logrado
MIN_OBSERVATIONS: int = 3           # observaciones mínimas antes de consolidar un criterio
CRITERIA_TO_CONSOLIDATE: int = 3    # de 4 por nivel
CALIBRATED_BIAS: float = 1.5        # |sesgo| ≤ 1.5 (escala 0-10) cuenta como calibrado (A4)
TIME_TOLERANCE: float = 0.30        # ±30 % del tiempo estimado (e1)
FADING_SUCCESSES: int = 2           # cumplir un criterio 2 veces sin ayuda retira su apoyo

# Estrategias activas y recomendaciones por perfil de calibración (priors de Thompson).
STRATEGIES: List[str] = ["est7", "est2", "est4", "est8"]
STRATEGY_NAMES: Dict[str, str] = {
    "est7": "Metas paso a paso",
    "est2": "Termómetro de confianza",
    "est4": "Reloj del reto",
    "est8": "¿Qué me dice el error?",
}
RECOMMENDED_BY_PROFILE: Dict[str, List[str]] = {
    "over": ["est2", "est8"],   # sobreconfianza → monitoreo y autodiagnóstico
    "sub": ["est7", "est2"],    # subestimación → metas pequeñas y autoeficacia
    "cal": ["est4", "est7"],    # calibrado → regulación del tiempo y planificación
    "time": ["est4"],           # estimación temporal poco realista
}


def tutor_domain_payload() -> dict:
    """Versión serializable del dominio para el frontend (misma fuente de verdad)."""
    return {
        "levels": LEVELS,
        "level_labels": LEVEL_LABELS,
        "dimensions": DIMENSIONS,
        "criteria": CRITERIA,
        "indicators": INDICATORS,
        "blocking_prior": BLOCKING_PRIOR,
        "blocking_signals": BLOCKING_SIGNALS,
        "scaffold_ladder": SCAFFOLD_LADDER,
        "tactics": TACTICS,
        "thresholds": {
            "mastery": MASTERY_THRESHOLD,
            "min_observations": MIN_OBSERVATIONS,
            "criteria_to_consolidate": CRITERIA_TO_CONSOLIDATE,
            "calibrated_bias": CALIBRATED_BIAS,
            "time_tolerance": TIME_TOLERANCE,
            "fading_successes": FADING_SUCCESSES,
        },
        "tech_ladder": TECH_LADDER,
        "components": COMPONENTS,
        "strategies": STRATEGY_NAMES,
    }
