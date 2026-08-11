import { useCallback, useEffect, useRef } from 'react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { api } from '../services/api';
import { jolGenerales } from '../data/jolGenerales';

const syncChannel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('mp-sync')
  : null;

// Map for known general JOL capacity options (4 options each → evenly distributed 1-10)
const CAPACITY_OPTIONS: Record<string, number[]> = {
  'JG-B3': [1, 3.3, 6.6, 10],
  'JG-M3': [2.5, 5, 7.5, 10],
  'JG-A3': [1, 3.3, 6.6, 10],
};

function normalizeJolForSync(jolId: string, value: number | string, tiempoEstimado?: number): { tipo: 'escala'; valor: number } {
  if (typeof value === 'string') {
    // Check if it has a "N=Texto" pattern (challenge-specific radio options)
    const numMatch = value.match(/^(\d+)=/);
    if (numMatch) {
      const n = parseInt(numMatch[1]);
      const maxOpts = value.split('=').length > 0 ? Math.max(n, 4) : 5;
      return { tipo: 'escala', valor: Math.round(((n - 1) / (maxOpts - 1)) * 10 * 100) / 100 };
    }
    // General JOL options (JG-B3, JG-M3, JG-A3) - full text stored
    const opts = CAPACITY_OPTIONS[jolId];
    if (opts) {
      const idx = jolGenerales
        .find(j => j.id === jolId)
        ?.escala.split('·')
        .map(s => s.trim())
        .findIndex(o => o.toLowerCase() === value.toLowerCase().trim());
      if (idx !== undefined && idx >= 0 && idx < opts.length) return { tipo: 'escala', valor: opts[idx] };
    }
    return { tipo: 'escala', valor: 5 };
  }

  const general = jolGenerales.find(j => j.id === jolId);
  if (general) {
    if (/min/i.test(general.escala)) {
      const maxTime = tiempoEstimado || 15;
      return { tipo: 'escala', valor: Math.max(0, Math.min(10, Math.round((10 - (value / maxTime) * 10) * 100) / 100)) };
    }
    if (/intentos/i.test(general.escala)) {
      const maxAttempts = 10;
      return { tipo: 'escala', valor: Math.max(0, Math.min(10, Math.round((10 - (value / maxAttempts) * 10) * 100) / 100)) };
    }
    if (/%/.test(general.escala)) {
      return { tipo: 'escala', valor: Math.round((value / 10) * 100) / 100 };
    }
  }

  if (value <= 5) {
    return { tipo: 'escala', valor: Math.round(((value - 1) / 4) * 10 * 100) / 100 };
  }
  if (value <= 10) {
    return { tipo: 'escala', valor: value };
  }
  return { tipo: 'escala', valor: Math.round((value / 10) * 100) / 100 };
}

const SYNCED_SESSIONS_KEY = 'mp-synced-sessions';

// Generation counter to detect cross-tab overwrites
const SYNC_GEN_KEY = 'mp-sync-generation';

function getSyncGeneration(): number {
  try {
    return parseInt(localStorage.getItem(SYNC_GEN_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

function getSyncedSessions(): Set<string> {
  try {
    const raw = localStorage.getItem(SYNCED_SESSIONS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function getDbUserId(): string | null {
  try {
    return localStorage.getItem('mp-db-user-id');
  } catch {
    return null;
  }
}

function setDbUserId(id: string) {
  localStorage.setItem('mp-db-user-id', id);
}

function markSynced(sessionId: string) {
  const set = getSyncedSessions();
  set.add(sessionId);
  const nextGen = getSyncGeneration() + 1;
  localStorage.setItem(SYNC_GEN_KEY, String(nextGen));
  localStorage.setItem(SYNCED_SESSIONS_KEY, JSON.stringify([...set]));
  syncChannel?.postMessage({ type: 'synced', sessionId, generation: nextGen });
}

function listenCrossTabSync(onSynced: (sessionId: string) => void) {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === SYNCED_SESSIONS_KEY && e.newValue) {
      // Another tab updated the sync set — merge locally
    }
  };
  const handleChannel = (e: MessageEvent) => {
    if (e.data?.type === 'synced') {
      onSynced(e.data.sessionId);
    }
  };
  window.addEventListener('storage', handleStorage);
  syncChannel?.addEventListener('message', handleChannel);
  return () => {
    window.removeEventListener('storage', handleStorage);
    syncChannel?.removeEventListener('message', handleChannel);
  };
}

function clearPhaseData(sessionId: string) {
  try {
    const storeRaw = localStorage.getItem('meta-pathfinder-storage');
    if (storeRaw) {
      const state = JSON.parse(storeRaw);
      if (state.state) {
        state.state.events = [];
        state.state.currentSessionId = '';
        state.state.currentChallengeId = null;
        state.state.cognitiveLoad = 0.45;
        state.state.calibration = 0.82;
        state.state.latentStrategies = [];
        state.state.transferReadiness = 0.5;
      }
      localStorage.setItem('meta-pathfinder-storage', JSON.stringify(state));
    }
    console.log('[PhaseSync] localStorage limpiado para sesión:', sessionId);
  } catch (err) {
    console.warn('[PhaseSync] Error limpiando localStorage:', err);
  }
}

async function ensureUser(store: ReturnType<typeof useCognitiveStore.getState>): Promise<string | null> {
  const { user, dbUserId, token } = store;
  if (!user) return null;

  if (token && dbUserId) return dbUserId;

  const cachedId = getDbUserId();
  if (cachedId) return cachedId;

  if (token) {
    try {
      const me = await api.getMe();
      setDbUserId(me.id);
      return me.id;
    } catch {
      console.warn('[PhaseSync] Could not fetch current user');
      return null;
    }
  }

  console.warn('[PhaseSync] No authenticated user');
  return null;
}

export function usePhaseSync() {
  const store = useCognitiveStore();

  const syncPhaseA = useCallback(async () => {
    const state = useCognitiveStore.getState();
    const {
      user, currentSessionId, currentLevel, currentChallengeId,
      assignedStrategyId, strategyAssignedRandomly,
    } = state;
    if (!user || !currentSessionId || !currentChallengeId) {
      console.log('[PhaseSync] Skip Phase A sync: missing user/session/challenge');
      return;
    }
    if (getSyncedSessions().has(`${currentSessionId}-phase-a`)) return;

    const userId = await ensureUser(state);
    if (!userId) return;

    try {
      await api.completePhaseA({
        session_id: currentSessionId,
        user_id: userId,
        current_level: currentLevel,
        current_challenge_id: currentChallengeId,
        assigned_strategy_id: assignedStrategyId,
        strategy_assigned_randomly: strategyAssignedRandomly,
        experiment_group: null,
      });

      markSynced(`${currentSessionId}-phase-a`);
      console.log('[PhaseSync] Fase A sincronizada');
    } catch (err) {
      console.warn('[PhaseSync] Error syncing phase A:', err);
    }
  }, []);

  const syncPhaseB = useCallback(async () => {
    const state = useCognitiveStore.getState();
    const { currentSessionId } = state;
    if (!currentSessionId) return;
    if (getSyncedSessions().has(`${currentSessionId}-phase-b`)) return;

    try {
      const lastChallengeEvent = [...state.events]
        .reverse()
        .find(e => e.type === 'CHALLENGE_COMPLETED');
      if (!lastChallengeEvent?.metadata) return;

      const meta = lastChallengeEvent.metadata;
      const score = (meta as any)?.технические_метрики?.score || 0;
      const biometricas = (meta as any)?.biometricas || {};

      await api.completePhaseB({
        session_id: currentSessionId,
        challenge_result: {
          challenge_id: (meta as any).challengeId || state.currentChallengeId || '',
          score,
          max_score: 100,
          time_spent_seconds: biometricas.total_time || 0,
          clicks: biometricas.clicks || 0,
          mouse_distance: biometricas.mouse_distance || 0,
          attempts: (meta as any)?.технические_метрики?.runs || 1,
          hints_used: (meta as any)?.технические_метрики?.hints || 0,
          passed: score >= 60,
        },
        cognitive_events: state.events
          .filter(e => e.type !== 'CHALLENGE_COMPLETED')
          .slice(-50)
          .map(e => ({
            event_type: e.type,
            timestamp: new Date(e.timestamp).toISOString(),
            metadata: e.metadata as Record<string, unknown>,
          })),
      });

      markSynced(`${currentSessionId}-phase-b`);
      console.log('[PhaseSync] Fase B sincronizada');
    } catch (err) {
      console.warn('[PhaseSync] Error syncing phase B:', err);
    }
  }, []);

  const syncPhaseC = useCallback(async () => {
    const state = useCognitiveStore.getState();
    const { currentSessionId } = state;
    if (!currentSessionId) return;
    if (getSyncedSessions().has(`${currentSessionId}-phase-c`)) return;

    try {
      const lastChallengeEvent = [...state.events]
        .reverse()
        .find(e => e.type === 'CHALLENGE_COMPLETED');
      if (!lastChallengeEvent?.metadata) return;

      const meta = lastChallengeEvent.metadata as Record<string, unknown>;
      const jolAnswers = (meta.jol_answers as Record<string, number | string>) || (meta.jolAnswers as Record<string, number | string>) || {};
      const estimatedTime = (meta.estimatedTime as number) || 0;

      const entries = Object.entries(jolAnswers);
      if (entries.length === 0) return;

      const jolInputs = entries.map(([key, value]) => normalizeJolForSync(key, value, estimatedTime));
      const performanceScore = ((meta as any)?.технические_метрики?.score ?? 50) / 10;

      await api.completePhaseC({
        session_id: currentSessionId,
        jols: jolInputs,
        actual_scores: entries.map(() => performanceScore),
        reflection_text: (meta.reflection_text as string) || null,
      });

      markSynced(`${currentSessionId}-phase-c`);
      console.log('[PhaseSync] Fase C sincronizada');
    } catch (err) {
      console.warn('[PhaseSync] Error syncing phase C:', err);
    }
  }, []);

  const syncSessionComplete = useCallback(async () => {
    const state = useCognitiveStore.getState();
    const { currentSessionId, user } = state;
    if (!currentSessionId || !user) return;
    if (getSyncedSessions().has(`${currentSessionId}-complete`)) return;

    try {
      const lastEvents = state.events.filter(e => e.type === 'CHALLENGE_COMPLETED');
      const lastMeta = lastEvents[lastEvents.length - 1]?.metadata;
      const totalTime = (lastMeta as any)?.biometricas?.total_time || 0;
      const totalClicks = (lastMeta as any)?.biometricas?.clicks || 0;
      const score = (lastMeta as any)?.технические_метрики?.score || 0;

      const dbUser = await api.getUserByEmail(user.email).catch(() => null);
      if (!dbUser) return;

      await api.completeSession(currentSessionId, {
        session_id: currentSessionId,
        user_id: dbUser.id,
        total_time_seconds: totalTime,
        total_clicks: totalClicks,
        total_navigations: 1,
        final_score: score,
        completed_at: new Date().toISOString(),
      });

      markSynced(`${currentSessionId}-complete`);
      console.log('[PhaseSync] Sesión completada y sincronizada');
      clearPhaseData(currentSessionId);
    } catch (err) {
      console.warn('[PhaseSync] Error syncing session:', err);
    }
  }, []);

  useEffect(() => {
    return listenCrossTabSync((sessionId) => {
      console.log('[PhaseSync] Cross-tab synced:', sessionId);
    });
  }, []);

  return { syncPhaseA, syncPhaseB, syncPhaseC, syncSessionComplete };
}

export function usePageLeaveSave() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      const storeRaw = localStorage.getItem('meta-pathfinder-storage');
      if (storeRaw) {
        const state = JSON.parse(storeRaw);
        if (state.state?.events?.length > 0) {
          state.state._lastSave = Date.now();
          localStorage.setItem('meta-pathfinder-storage', JSON.stringify(state));
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBeforeUnload();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
