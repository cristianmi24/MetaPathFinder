"""Sesgo ajustado por dificultad: un cambio de escalón no debe confundirse con un cambio del monitoreo."""
import pytest

from app.services.tutor import engine
from app.services.tutor import profile as learner

CH_N1 = {"id": "RB-C1-N1", "criterios": [], "titulo": "x"}
CH_N2 = {"id": "RB-C1-N2", "criterios": [], "titulo": "x"}


def _obs(**kw):
    base = {"estimated_minutes": 5, "total_time_seconds": 300, "runs": 1, "err_count": 0, "hint_count": 0,
            "passed": True, "strategy_id": "est2"}
    base.update(kw)
    return base


def test_difficulty_offset_follows_hard_easy_effect():
    assert learner.difficulty_offset(None) == 0.0
    assert learner.difficulty_offset(5.0) == 0.0                   # sin evidencia (Beta(1,1)): sin ajuste
    assert learner.difficulty_offset(2.0) == pytest.approx(1.5)    # escalón difícil: se espera más sesgo
    assert learner.difficulty_offset(8.0) == pytest.approx(-1.5)   # escalón fácil: se espera menos


def test_easier_step_alone_is_not_counted_as_strategy_success():
    state = engine.new_state()
    state["tech"]["C1"]["RB-N2"] = [1.0, 4.0]   # le cuesta N2: P(dominio)=0,2 → esperado 2
    state["tech"]["C1"]["RB-N1"] = [4.0, 1.0]   # domina N1: esperado 8
    out = engine.process_phase_c(state, _obs(passed=False), {"bias_index": 3.0}, CH_N2, "experimental", "s1")
    assert out["difficulty"]["bias_adj"] == pytest.approx(1.5)
    # Baja a N1 y el sesgo crudo cae de 3 a 1: en crudo parecería que la estrategia funcionó.
    out2 = engine.process_phase_c(out["state"], _obs(), {"bias_index": 1.0}, CH_N1, "experimental", "s2")
    so = out2["strategy_outcome"]
    assert so["bias_adj"] == pytest.approx(2.5) and so["same_step"] is False
    assert so["success"] is False
    assert out2["state"]["history"][-1]["step"] == "RB-N1"
    assert out2["state"]["history"][-1]["expected_perf"] == pytest.approx(8.0)


def test_kalman_uses_difficulty_adjusted_bias():
    easy = learner.update_profile(learner.new_profile(), {}, {}, bias=1.0, offset=learner.difficulty_offset(8.0))
    hard = learner.update_profile(learner.new_profile(), {}, {}, bias=1.0, offset=learner.difficulty_offset(2.0))
    # El mismo sesgo crudo pesa más como sobreconfianza en un escalón fácil que en uno difícil.
    assert easy["bias"]["mean"] > 0 > hard["bias"]["mean"]


def test_states_saved_before_the_adjustment_still_work():
    state = engine.new_state()
    state["last_bias"], state["last_strategy"] = 3.0, "est2"   # estado viejo: sin last_bias_adj ni last_step
    out = engine.process_phase_c(state, _obs(), {"bias_index": 0.5}, CH_N1, "experimental", "s1")
    assert out["strategy_outcome"]["prev_bias_adj"] == 3.0 and out["strategy_outcome"]["success"] is True
