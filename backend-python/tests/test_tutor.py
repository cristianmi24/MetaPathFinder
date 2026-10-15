"""Pruebas del motor bayesiano con los ejemplos del documento de diseño."""
import random

import pytest

from app.services.calibration import compute_calibration
from app.services.tutor import domain, engine
from app.services.tutor.bayes import beta_mean, beta_update, is_mastered, naive_bayes_bernoulli
from app.services.tutor.indicators import behavior_indicators, text_indicators


def test_naive_bayes_matches_design_example():
    obs = {"e1": True, "e2": True, "e4": True, "e5": True, "f2": True, "f3": False}
    lik = {i["id"]: i["p"] for i in domain.INDICATORS}
    post = naive_bayes_bernoulli(obs, lik, domain.LEVELS)
    assert post["basico"] == pytest.approx(0.007, abs=0.002)
    assert post["medio"] == pytest.approx(0.779, abs=0.005)
    assert post["avanzado"] == pytest.approx(0.214, abs=0.005)


def test_blocking_probability_examples():
    p1 = engine.blocking({"errores_seguidos": True, "pausa_larga": True})
    assert p1 == pytest.approx(0.485, abs=0.01)
    p2 = engine.blocking({"errores_seguidos": True, "pausa_larga": True, "ediciones_sin_exito": True})
    assert p2 == pytest.approx(0.767, abs=0.01)
    assert engine.scaffold_level(p1) == "N0"
    assert engine.scaffold_level(p2) == "N2"
    assert engine.scaffold_level(p2, consecutive_high=2) == "N3"
    assert engine.scaffold_level(0.1) is None


def test_beta_bernoulli_sequence_and_mastery():
    a, b = 1.0, 1.0
    seq = [True, True, False, True, True]
    means = []
    for s in seq:
        a, b = beta_update(a, b, s)
        means.append(round(beta_mean(a, b), 2))
    assert means == [0.67, 0.75, 0.6, 0.67, 0.71]
    # Con solo dos éxitos (Beta(3,1) = 0.75) NO se consolida: faltan observaciones.
    assert not is_mastered(3, 1, domain.MASTERY_THRESHOLD, domain.MIN_OBSERVATIONS)
    assert is_mastered(a, b, domain.MASTERY_THRESHOLD, domain.MIN_OBSERVATIONS)


def test_zdp_location_rules():
    st = engine.new_state()
    assert engine.locate_zdp(st)["zdp"] == "basico"
    for cid in ("B1", "B2", "B3"):
        st["criteria"][cid] = [5.0, 1.0]
    loc = engine.locate_zdp(st)
    assert loc["consolidated"] == "basico" and loc["zdp"] == "medio"
    for cid in ("M1", "M2", "M4"):
        st["criteria"][cid] = [5.0, 1.0]
    assert engine.locate_zdp(st)["zdp"] == "avanzado"
    for cid in ("A1", "A2", "A4"):
        st["criteria"][cid] = [5.0, 1.0]
    loc = engine.locate_zdp(st)
    assert loc["consolidated"] == "avanzado" and loc["fading"] is True


def test_text_indicators_anchor_examples():
    crit = ["1. Ordena correctamente los ocho hitos.", "2. Reconoce la secuencia.", "3. Corrige el orden a partir de la verificación."]
    basico = text_indicators("Pensé que me iba a ir bien porque puse 9 de confianza, pero saqué 4. Creía que sabía más de lo que sabía.", "", "", crit, "Línea del tiempo")
    assert basico["f1"] and not basico["f2"] and not basico["f3"]
    medio = text_indicators("La diferencia fue porque empecé sin leer bien los criterios. Si hubiera revisado el criterio 2 antes, no habría tenido tantos errores.", "", "", crit, "")
    assert medio["f1"] and medio["f2"] and not medio["f3"]
    avanzado = text_indicators("Mi predicción fue casi exacta porque antes de empezar identifiqué que lo difícil era la consulta. Escribir qué esperaba de cada ejecución me ayudó, y lo voy a usar también en los retos de Arduino.", "", "", crit, "")
    assert avanzado["f1"] and avanzado["f3"]
    nada = text_indicators("No sé, me fue mal.", "Todo.", "Ninguna.", crit, "")
    assert not nada["f1"] and not nada["f2"] and not nada["f3"] and not nada["f4"]
    m3 = text_indicators("", "El criterio 3, porque no sé bien cómo diferenciar las categorías", "", crit, "")
    assert m3["f4"]
    m3_basic = text_indicators("", "La parte de programar.", "", crit, "")
    assert not m3_basic["f4"]
    a3 = text_indicators("", "", "En el reto de SQL aprendí a escribir qué espero antes de ejecutar. Aquí lo aplicaré a cada bloque del circuito.", crit, "")
    assert a3["experience_cited"]


def test_behavior_indicators_time_and_hints():
    ind = behavior_indicators({"estimated_minutes": 10, "total_time_seconds": 11 * 60, "runs": 3, "err_count": 2,
                               "hint_count": 1, "hint_requested_after_error": True, "hint_requested_before_third_attempt": True,
                               "auto_hint_shown": False, "reflexive_brake_triggered": False, "jol_inicial": 8,
                               "checkpoints": [5], "passed": False, "tab_changes": 0})
    assert ind["e1"] is True and ind["e2"] is True and ind["e3"] is True and ind["e4"] is True
    assert ind["e5"] is True  # bajó la confianza tras errores sin aprobar
    assert ind["e8"] is True
    ind2 = behavior_indicators({"estimated_minutes": 10, "total_time_seconds": 20 * 60, "runs": 1, "err_count": 0, "passed": True})
    assert ind2["e1"] is False and ind2["e2"] is None and ind2["e5"] is None


def test_process_phase_c_full_cycle():
    st = engine.new_state()
    cal = compute_calibration([{"tipo": "escala", "valor": 9, "kind": "confianza"}], [5.0])
    assert cal["bias_index"] == 4.0 and cal["cluster"] == "over" and cal["banda"] == "marcada"
    obs = {"estimated_minutes": 10, "total_time_seconds": 600, "runs": 3, "err_count": 2, "hint_count": 1,
           "auto_hint_shown": False, "reflexive_brake_triggered": False, "jol_inicial": 9, "checkpoints": [6],
           "checkpoints_requested": True, "attempts_after_hint": 1, "passed": False, "score": 50,
           "jol_raw": {"JG-B1": 9, "JG-B2": 10, "JG-B3": "Lo domino"}, "strategy_id": "est2",
           "reflection_text": "Pensé que me iba a ir bien, puse 9 pero saqué 5. Creía que sabía más."}
    challenge = {"id": "RB-C1-N1", "titulo": "Línea del tiempo", "criterios": ["1. Ordena los hitos."]}
    out = engine.process_phase_c(st, obs, cal, challenge, "experimental", "S1")
    assert out["criteria_observed"]["B1"] is True and out["criteria_observed"]["B4"] is True
    assert out["criteria_observed"]["M4"] is False
    assert "Ya logras" in out["feedback"]["message"] and "siguiente paso" in out["feedback"]["message"]
    assert out["state"]["tech"]["C1"]["RB-N1"] == [1.0, 2.0]
    assert out["reading"]["level"] in domain.LEVELS
    # Segundo reto con sesgo menor → Thompson registra éxito de la estrategia usada
    cal2 = compute_calibration([{"tipo": "escala", "valor": 7, "kind": "confianza"}], [6.0])
    out2 = engine.process_phase_c(out["state"], {**obs, "passed": True, "score": 60}, cal2, challenge, "experimental", "S2")
    assert out2["strategy_outcome"]["success"] is True
    assert out2["state"]["strategies"]["over"]["est2"] == [3.0, 1.0]


def test_plan_prefers_unpracticed_component_and_control_is_random():
    st = engine.new_state()
    available = [{"id": f"RB-C{c}-N{n}"} for c in range(1, 5) for n in range(1, 4)]
    st["tech"]["C1"]["RB-N1"] = [4.0, 1.0]
    plan = engine.plan_session(st, "Básico", available, "experimental", random.Random(1))
    assert plan["challenge"]["challenge_id"].startswith("RB-C2") or plan["challenge"]["challenge_id"].startswith("RB-C3")
    assert plan["strategy"]["method"] == "thompson"
    ctrl = engine.plan_session(st, "Básico", available, "control", random.Random(1))
    assert ctrl["strategy"]["method"] == "aleatoria"
    assert plan["scaffold"]["type"] == "conciencia"


def test_calibration_metrics_multi_item():
    jols = [{"tipo": "escala", "valor": v, "kind": "confianza"} for v in (9, 8, 3, 2)]
    cal = compute_calibration(jols, [10, 9, 2, 1], estimated_minutes=10, actual_minutes=12)
    assert cal["gamma"] == 1.0
    assert cal["discriminacion"] > 0
    assert cal["banda"] == "calibrado"
    assert cal["time_calibration"]["within_tolerance"] is True
    mixed = compute_calibration([{"tipo": "escala", "valor": 9, "kind": "confianza"}, {"tipo": "escala", "valor": 1, "kind": "tiempo"}], [5, 5])
    assert mixed["n_confianza"] == 1 and mixed["bias_index"] == 4.0
