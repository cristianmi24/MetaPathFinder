"""Pruebas del perfil dinámico del estudiante y de cómo alimenta las decisiones del tutor."""
import random

import pytest

from app.services.tutor import domain, engine
from app.services.tutor import profile as learner


def _obs(**kw):
    base = {"estimated_minutes": 5, "total_time_seconds": 300, "runs": 1, "err_count": 0, "hint_count": 0,
            "auto_hint_shown": False, "reflexive_brake_triggered": False, "passed": True, "tab_changes": 0,
            "checkpoints": [], "strategy_evidence": {}, "time_before_first_edit": 30}
    base.update(kw)
    return base


def test_kalman_needs_several_challenges_to_label_overconfidence():
    p = learner.new_profile()
    p = learner.update_profile(p, {}, _obs(), bias=3.0)
    one = learner.summary(p)["calibration"]
    assert one["class"] in ("over", "cal")
    assert one["probs"]["over"] < 0.8          # un solo reto no basta para estar seguro
    for _ in range(3):
        p = learner.update_profile(p, {}, _obs(), bias=3.0)
    many = learner.summary(p)["calibration"]
    assert many["class"] == "over"
    assert many["probs"]["over"] > one["probs"]["over"]
    assert many["bias_sd"] < one["bias_sd"]     # la incertidumbre baja con evidencia


def test_kalman_follows_change_thanks_to_process_noise():
    p = learner.new_profile()
    for _ in range(5):
        p = learner.update_profile(p, {}, _obs(), bias=3.0)
    for _ in range(4):
        p = learner.update_profile(p, {}, _obs(), bias=0.0)
    assert learner.summary(p)["calibration"]["class"] == "cal"


def test_traits_accumulate_and_forget():
    p = learner.new_profile()
    for _ in range(4):
        p = learner.update_profile(p, {"e4": False}, _obs(), bias=None)
    t = learner.trait_summary(p)
    assert t["control_impulsos"]["status"] == "a_trabajar"
    assert t["planificacion"]["status"] == "sin_datos"     # e7 no observado → sin evidencia
    for _ in range(6):
        p = learner.update_profile(p, {"e4": True}, _obs(), bias=None)
    assert learner.trait_summary(p)["control_impulsos"]["status"] == "fortaleza"


def test_blocking_prior_is_personal_and_bounded():
    p = learner.new_profile()
    assert learner.blocking_prior(p) == pytest.approx(domain.BLOCKING_PRIOR)
    for _ in range(6):
        p = learner.update_profile(p, {}, _obs(hint_count=2, passed=False), bias=None)
    high = learner.blocking_prior(p)
    assert domain.BLOCKING_PRIOR < high <= learner.BLOCK_PRIOR_MAX
    for _ in range(15):
        p = learner.update_profile(p, {}, _obs(), bias=None)
    assert learner.BLOCK_PRIOR_MIN <= learner.blocking_prior(p) < domain.BLOCKING_PRIOR


def test_scaffold_plan_is_personalized_by_profile():
    p = learner.new_profile()
    for _ in range(4):
        p = learner.update_profile(p, {"e4": False}, _obs(), bias=3.0)
    plan = engine.scaffold_plan("medio", p)
    assert plan["mandatory_checkpoints"] is True              # medio no los pide por defecto
    assert plan["focus_trait"] == "control_impulsos"
    assert plan["messages"][0] == engine.TRAIT_MESSAGES["control_impulsos"]
    assert plan["personalized"]
    assert engine.scaffold_plan("medio")["mandatory_checkpoints"] is False


def test_strategy_uses_dynamic_profile_not_last_challenge():
    state = engine.new_state()
    for _ in range(4):
        state["profile"] = learner.update_profile(state["profile"], {}, _obs(), bias=3.0)
    state["last_profile"] = "sub"                  # un reto atípico al final
    choice = engine.choose_strategy(state, "experimental", random.Random(1))
    assert choice["profile"] == "over"
    assert "probabilidad" in choice["reason"]


def test_reading_prior_smooths_level_jumps():
    hist = [{"posterior": {"basico": 0.9, "medio": 0.08, "avanzado": 0.02}}]
    prior = engine.reading_prior(hist)
    assert prior["basico"] > prior["medio"] > prior["avanzado"]
    assert sum(prior.values()) == pytest.approx(1.0)
    assert engine.reading_prior([]) is None


def test_phase_c_updates_profile_end_to_end():
    state = engine.new_state()
    cal = {"bias_index": 2.5, "cluster": "over"}
    obs = _obs(err_count=2, runs=3, hint_count=1, passed=False, strategy_id="est2",
               jol_raw={"JG-B1": 9}, reflection_text="Me fue mal porque no revisé")
    res = engine.process_phase_c(state, obs, cal, {"id": "RB-C1-N1", "criterios": [], "titulo": "x"}, "experimental", "s1")
    assert res["profile"]["challenges"] == 1
    assert res["profile"]["calibration"]["bias_mean"] > 0
    assert res["profile"]["blocking_prior"] > domain.BLOCKING_PRIOR
    assert res["state"]["profile"]["n"] == 1
