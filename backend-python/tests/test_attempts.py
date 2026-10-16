"""Pruebas de la captura por intento: Brier por intento, Kalman con pares y abuso/evitación de la ayuda."""
import pytest

from app.services.tutor import engine
from app.services.tutor import profile as learner
from app.services.tutor.indicators import attempt_summary


def _a(t, correct, confidence=None, **kw):
    return {"t": t, "correct": correct, "confidence": confidence, **kw}


def _h(t, level, auto=False, **kw):
    return {"t": t, "level": level, "auto": auto, **kw}


def test_brier_per_attempt_uses_only_attempts_with_confidence():
    s = attempt_summary({"attempt_log": [_a(10, False, 9), _a(20, True, 6), _a(30, True)]})
    # ((0,9 − 0)² + (0,6 − 1)²) / 2 = (0,81 + 0,16) / 2
    assert s["brier_attempts"] == pytest.approx(0.485)
    assert s["confidence_pairs"] == [[9.0, False], [6.0, True]]
    assert attempt_summary({"attempt_log": [_a(1, True)]})["brier_attempts"] is None


def test_help_abuse_three_hints_without_attempts():
    s = attempt_summary({"attempt_log": [_a(5, False)], "hint_log": [_h(10, 1), _h(12, 2), _h(14, 3)]})
    assert s["help_abuse"] is True
    # Con un intento entre la 2 y la 3 ya no es abuso.
    s2 = attempt_summary({"attempt_log": [_a(13, False)], "hint_log": [_h(10, 1), _h(12, 2), _h(14, 3)]})
    assert s2["help_abuse"] is False
    # Las pistas automáticas no las pidió el estudiante.
    s3 = attempt_summary({"attempt_log": [], "hint_log": [_h(10, 1, auto=True), _h(12, 2), _h(14, 3)]})
    assert s3["help_abuse"] is False


def test_help_avoidance_four_failures_without_hint():
    fails = [_a(t, False) for t in (10, 20, 30, 40)]
    assert attempt_summary({"attempt_log": fails})["help_avoidance"] is True
    s = attempt_summary({"attempt_log": fails, "hint_log": [_h(25, 1)]})
    assert s["help_avoidance"] is False          # pidió pista tras el segundo fallo
    s2 = attempt_summary({"attempt_log": [_a(10, False), _a(20, False), _a(25, True), _a(30, False), _a(40, False)]})
    assert s2["help_avoidance"] is False         # un acierto corta la racha
    assert attempt_summary({})["help_avoidance"] is None and attempt_summary({})["help_abuse"] is None


def test_followthrough_and_trial_and_error():
    s = attempt_summary({"attempt_log": [_a(10, False, trial_and_error=True), _a(12, False, trial_and_error=True)],
                         "hint_log": [_h(5, 1, visible_ms=4000, next_delta=0), _h(11, 2, visible_ms=8000, next_delta=3)]})
    assert s["trial_and_error"] == 2
    assert s["hint_followthrough"] == 0.5
    assert s["hint_visible_ms_mean"] == 6000


def test_kalman_updates_with_each_confidence_pair():
    base = learner.update_profile(learner.new_profile(), {}, {}, bias=0.0)
    over = {"confidence_pairs": [[9, False]] * 5, "brier_attempts": 0.81}
    p = learner.update_profile(learner.new_profile(), {}, {}, bias=0.0, attempts=over)
    assert p["bias"]["mean"] > base["bias"]["mean"] + 1     # confianza 9 con fallos → sobreconfianza
    assert p["bias"]["var"] < base["bias"]["var"]            # más evidencia, menos incertidumbre
    assert p["bias"]["n"] == 6
    assert learner.summary(p)["attempt_brier"] == pytest.approx(0.81)
    # Solo pares (reto sin sesgo de Fase C) también actualizan.
    q = learner.update_profile(learner.new_profile(), {}, {}, bias=None, attempts=over)
    assert q["bias"]["mean"] > 0


def test_help_patterns_lower_help_seeking_trait():
    p = learner.new_profile()
    for _ in range(4):
        p = learner.update_profile(p, {"e2": True}, {}, bias=None, attempts={"help_abuse": True, "help_avoidance": False})
    t = learner.trait_summary(p)["busqueda_ayuda"]
    assert t["status"] == "a_trabajar"                       # e2 decía sí, pero abusó de la ayuda
    assert learner.summary(p)["help_patterns"]["abuse"] == pytest.approx(1.0)
    assert learner.help_seeking_observation(None, {"help_avoidance": True}) is False
    assert learner.help_seeking_observation(True, {"help_abuse": False, "help_avoidance": False}) is True


def test_phase_c_passes_attempt_log_to_profile():
    state = engine.new_state()
    obs = {"estimated_minutes": 5, "total_time_seconds": 300, "runs": 4, "err_count": 4, "hint_count": 0, "passed": False,
           "attempt_log": [_a(t, False, 8) for t in (10, 20, 30, 40)]}
    res = engine.process_phase_c(state, obs, {"bias_index": 1.0}, {"id": "RB-C1-N1", "criterios": [], "titulo": "x"}, "experimental", "s1")
    assert res["attempts"]["help_avoidance"] is True
    assert res["attempts"]["brier_attempts"] == pytest.approx(0.64)
    assert res["profile"]["traits"]["busqueda_ayuda"]["evidence"] > 0
    assert res["profile"]["calibration"]["bias_mean"] > 1.0


def test_followthrough_falls_back_to_edits_when_board_gives_no_answer():
    s = attempt_summary({"hint_log": [_h(5, 1, next_delta=None, next_changed=True), _h(9, 2, next_delta=None, next_changed=None)]})
    assert s["hint_followthrough"] == 1.0
