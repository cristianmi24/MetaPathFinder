#!/usr/bin/env python3
"""Prueba de carga: N estudiantes simultáneos recorren el ciclo completo (registro/login →
Fase A → eventos → Fase B → Fase C con tutor → estado del tutor). Solo biblioteca estándar.

    python scripts/loadtest.py --base http://localhost:3000 --users 50 --rounds 2

Imprime latencias p50/p95/máx por endpoint y el número de errores. Objetivo con 50 usuarios:
p95 < 800 ms en las fases y 0 errores 5xx.
"""
from __future__ import annotations

import argparse
import json
import random
import statistics
import threading
import time
import urllib.error
import urllib.request
from collections import defaultdict

LAT: dict[str, list[float]] = defaultdict(list)
ERR: dict[str, int] = defaultdict(int)
LOCK = threading.Lock()


def call(base: str, method: str, path: str, body=None, token=None, label=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(base + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            payload = json.loads(r.read() or b"{}")
            ok = True
    except urllib.error.HTTPError as e:
        payload, ok = {"status": e.code, "detail": e.read()[:200].decode(errors="ignore")}, e.code < 500
    except Exception as e:  # noqa: BLE001
        payload, ok = {"error": str(e)}, False
    dt = (time.perf_counter() - t0) * 1000
    with LOCK:
        LAT[label or path].append(dt)
        if not ok:
            ERR[label or path] += 1
    return payload


def student(base: str, idx: int, rounds: int, run_id: str):
    email = f"carga{run_id}_{idx}@test.local"
    pw = "CargaPrueba123!"
    call(base, "POST", "/api/auth/register", {"name": f"Carga{idx}", "last_name": "Test", "email": email, "password": pw,
                                             "terms_accepted": True, "guardian_declaration": True, "terms_version": "1.0"}, label="register")
    login = call(base, "POST", "/api/auth/login", {"email": email, "password": pw, "portal": "student"}, label="login")
    token = login.get("access_token")
    if not token:
        return
    uid = login["user"]["id"]
    for r in range(rounds):
        sid = f"LOAD-{run_id}-{idx}-{r}"
        plan = call(base, "POST", "/api/tutor/plan", {"user_id": uid, "level_name": "Básico", "session_id": sid,
                                                   "available": [{"id": f"RB-C{c}-N{n}"} for c in range(1, 5) for n in range(1, 4)]}, token, "tutor/plan")
        ch = (plan.get("challenge") or {}).get("challenge_id") or "RB-C1-N1"
        call(base, "POST", "/api/phase-a/complete", {"session_id": sid, "user_id": uid, "current_level": 1, "current_challenge_id": ch,
                                                    "assigned_strategy_id": (plan.get("strategy") or {}).get("strategy_id", "est2")}, token, "phase-a")
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        call(base, "POST", "/api/tracking/events", {"session_id": sid, "events": [{"event_type": "UI_CLICK", "timestamp": now, "metadata": {"i": i}} for i in range(20)]}, token, "tracking")
        score = random.choice([40, 60, 80, 100])
        call(base, "POST", "/api/phase-b/complete", {"session_id": sid, "challenge_result": {"challenge_id": ch, "score": score, "time_spent_seconds": 300, "attempts": 2, "hints_used": 1, "passed": score >= 60}}, token, "phase-b")
        call(base, "POST", "/api/phase-c/complete", {
            "session_id": sid, "jols": [{"tipo": "escala", "valor": 8, "kind": "confianza", "id": "JG-B1"}, {"tipo": "escala", "valor": 7, "kind": "tiempo", "id": "JG-B2"}],
            "actual_scores": [score / 10, score / 10], "reflection_text": "Pensé que me iba a ir bien pero no leí bien los criterios y me faltó revisar.",
            "estimated_minutes": 10, "actual_minutes": 5, "challenge": {"id": ch, "titulo": "Reto", "criterios": ["1. Ordena"]},
            "tutor_observations": {"err_count": 1, "hint_count": 1, "runs": 2, "passed": score >= 60, "score": score, "checkpoints": [6], "checkpoints_requested": True,
                                   "jol_inicial": 8, "jol_raw": {"JG-B1": 8, "JG-B2": 10, "JG-B3": "Lo domino"}, "strategy_id": "est2"},
        }, token, "phase-c(+tutor)")
        call(base, "GET", f"/api/tutor/state/{uid}", None, token, "tutor/state")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://localhost:3000")
    ap.add_argument("--users", type=int, default=50)
    ap.add_argument("--rounds", type=int, default=1)
    a = ap.parse_args()
    run_id = str(int(time.time()))[-6:]
    t0 = time.perf_counter()
    threads = [threading.Thread(target=student, args=(a.base, i, a.rounds, run_id), daemon=True) for i in range(a.users)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    total = time.perf_counter() - t0
    print(f"\n{a.users} estudiantes × {a.rounds} rondas en {total:.1f} s\n")
    print(f"{'endpoint':18} {'n':>5} {'p50 ms':>8} {'p95 ms':>8} {'máx ms':>8} {'errores':>8}")
    for k, v in sorted(LAT.items()):
        v = sorted(v)
        p95 = v[min(len(v) - 1, int(len(v) * 0.95))]
        print(f"{k:18} {len(v):5d} {statistics.median(v):8.0f} {p95:8.0f} {max(v):8.0f} {ERR.get(k, 0):8d}")
    print("\nCriterio: p95 < 800 ms y 0 errores en fases y tutor.")


if __name__ == "__main__":
    main()
