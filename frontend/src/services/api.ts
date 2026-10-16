const API_BASE = import.meta.env.VITE_API_URL || '';
const REQUEST_TIMEOUT_MS = 30000;

async function requestWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('meta-pathfinder-storage');
    if (raw) {
      const state = JSON.parse(raw);
      return state.state?.token || null;
    }
  } catch {}
  return null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await requestWithTimeout(url, { headers, ...options }, REQUEST_TIMEOUT_MS);
  } catch {
    // Network error (server down, no connection, timeout, etc.)
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
  }

  if (!res.ok) {
    // Try to extract a clean error message from the response
    let errorMessage = '';
    try {
      const data = await res.json();
      if (data && typeof data === 'object' && typeof data.detail === 'string') {
        errorMessage = data.detail;
      }
    } catch {
      // Response wasn't JSON — ignore the raw body
    }

    // Only redirect on 401 if accessing a protected endpoint (NOT login/register)
    if (res.status === 401 && !path.startsWith('/api/auth/')) {
      try {
        const raw = localStorage.getItem('meta-pathfinder-storage');
        if (raw) {
          const state = JSON.parse(raw);
          if (state.state) {
            state.state.token = null;
            state.state.user = null;
            state.state.role = null;
          }
          localStorage.setItem('meta-pathfinder-storage', JSON.stringify(state));
        }
      } catch {}
      window.location.href = '/';
      throw new Error('Sesión expirada');
    }

    // Fallback: if we couldn't extract a clean message, use a generic one based on context
    if (!errorMessage) {
      if (path.includes('/auth/login')) {
        errorMessage = 'Correo electrónico o contraseña incorrectos.';
      } else if (path.includes('/auth/register')) {
        errorMessage = 'No se pudo crear la cuenta. Verifica tus datos e intenta de nuevo.';
      } else {
        errorMessage = `Error del servidor (${res.status}). Intenta de nuevo.`;
      }
    }

    throw new Error(errorMessage);
  }

  return res.json();
}

export const api = {
  // Auth
  /** `portal` restringe el acceso por rol: el de estudiantes no abre el panel y viceversa. */
  login: (email: string, password: string, portal: 'student' | 'admin') =>
    request<{ access_token: string; token_type: string; user: { id: string; name: string; last_name: string; email: string; role: string; created_at: string } }>(
      '/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, portal }) }
    ),

  register: (data: { name: string; last_name: string; email: string; password: string; role?: string; terms_accepted: boolean; guardian_declaration: boolean; terms_version: string }) =>
    request<{ id: string; name: string; last_name: string; email: string; role: string; created_at: string }>(
      '/api/auth/register', { method: 'POST', body: JSON.stringify(data) }
    ),

  /** Alta de usuarios desde el panel (solo administradores). */
  createUser: (data: { name: string; last_name: string; email: string; password: string; role: string }) =>
    request<{ id: string; name: string; last_name: string; email: string; role: string; created_at: string }>(
      '/api/users/', { method: 'POST', body: JSON.stringify(data) }
    ),

  getMe: () =>
    request<{ id: string; name: string; last_name: string; email: string; role: string; created_at: string }>(
      '/api/auth/me'
    ),

  listUsers: () =>
    request<{ id: string; name: string; last_name: string; email: string; role: string; created_at: string }[]>(
      '/api/users/'
    ),

  getUser: (userId: string) =>
    request<{ id: string; name: string; last_name: string; email: string; role: string; created_at: string }>(
      `/api/users/${userId}`
    ),

  getUserByEmail: (email: string) =>
    request<{ id: string; name: string; last_name: string; email: string; role: string; created_at: string }>(
      `/api/users/by-email/${encodeURIComponent(email)}`
    ),

  updateUser: (userId: string, data: { name?: string; last_name?: string; email?: string }) =>
    request<{ id: string; name: string; last_name: string; email: string; role: string; created_at: string }>(
      `/api/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }
    ),

  deleteUser: (userId: string) =>
    request<{ status: string }>(`/api/users/${userId}`, { method: 'DELETE' }),

  // Phase A — session creation
  completePhaseA: (data: {
    session_id: string;
    user_id: string;
    current_level: number;
    current_challenge_id: string;
    assigned_strategy_id?: string | null;
    strategy_assigned_randomly?: boolean;
    experiment_group?: string | null;
  }) => request<{ status: string; session_id: string }>('/api/phase-a/complete', { method: 'POST', body: JSON.stringify(data) }),

  // Phase B — Challenge result + events
  completePhaseB: (data: {
    session_id: string;
    challenge_result: {
      challenge_id: string;
      score: number;
      max_score?: number;
      time_spent_seconds: number;
      clicks?: number;
      mouse_distance?: number;
      attempts?: number;
      hints_used?: number;
      passed?: boolean;
    };
    cognitive_events?: { event_type: string; timestamp: string; metadata?: Record<string, unknown> }[];
  }) => request<{ status: string; session_id: string }>('/api/phase-b/complete', { method: 'POST', body: JSON.stringify(data) }),

  // Phase C — Calibration (server computes calibration from raw JOLs + scores)
  completePhaseC: (data: {
    session_id: string;
    jols: { tipo: string; valor: number | string; tiempo_maximo?: number; kind?: string; id?: string }[];
    actual_scores: number[];
    reflection_text?: string | null;
    cognitive_events?: { event_type: string; timestamp: string; metadata?: Record<string, unknown> }[];
    tutor_observations?: Record<string, unknown>;
    challenge?: { id: string; titulo?: string; criterios?: string[] };
    estimated_minutes?: number;
    actual_minutes?: number;
  }) => request<{ status: string; session_id: string; calibration: Record<string, unknown>; tutor: TutorPhaseCResult | null }>('/api/phase-c/complete', { method: 'POST', body: JSON.stringify(data) }),

  // Tracking en tiempo real (lotes)
  // keepalive: el envío sobrevive al cierre de la pestaña (pagehide).
  trackEvents: (data: { session_id?: string | null; events: { event_type: string; timestamp: string; metadata?: Record<string, unknown> }[] }, keepalive = false) =>
    request<{ status: string; stored: number }>('/api/tracking/events', { method: 'POST', body: JSON.stringify(data), keepalive }),

  // Sistema tutor (Griffin + Bayes)
  getTutorDomain: () => request<TutorDomain>('/api/tutor/domain'),
  getTutorState: (userId: string) => request<TutorState>(`/api/tutor/state/${userId}`),
  tutorPlan: (data: { user_id: string; level_name: string; available: { id: string }[]; session_id?: string | null }) =>
    request<TutorPlan>('/api/tutor/plan', { method: 'POST', body: JSON.stringify(data) }),
  tutorOverride: (data: { user_id: string; session_id?: string | null; kind: 'strategy' | 'challenge' | 'advance'; chosen?: string; suggested?: string; reason?: string }) =>
    request<{ status: string }>('/api/tutor/override', { method: 'POST', body: JSON.stringify(data) }),
  saveLearningStyle: (data: { user_id: string; visual_verbal: number; global_sequential: number; answers?: Record<string, unknown> }) =>
    request<{ status: string; learning_style: LearningStyle }>('/api/tutor/learning-style', { method: 'POST', body: JSON.stringify(data) }),
  rateResource: (data: { user_id: string; resource_id: string; challenge_id?: string; helpful: boolean }) =>
    request<{ status: string }>('/api/tutor/resource-rating', { method: 'POST', body: JSON.stringify(data) }),
  recommendResource: (userId: string, challengeId?: string, exclude?: string) =>
    request<{ resource_id: string | null; helpful_ratio?: number; neighbours: number; source: string }>(
      `/api/tutor/recommend/${userId}?${new URLSearchParams({ ...(challengeId ? { challenge_id: challengeId } : {}), ...(exclude ? { exclude } : {}) })}`
    ),
  getClassMap: () => request<ClassMap>('/api/tutor/class-map'),
  getTutorAdminOverview: () => request<TutorAdminOverview>('/api/tutor/admin/overview'),
  getTutorAdminStudent: (userId: string) => request<TutorAdminStudent>(`/api/tutor/admin/student/${userId}`),

  // Session
  completeSession: (sessionId: string, data: {
    session_id: string;
    user_id: string;
    total_time_seconds: number;
    total_clicks: number;
    total_navigations: number;
    final_score: number;
    completed_at: string;
  }) => request<{ status: string }>(`/api/sessions/${sessionId}/complete`, { method: 'PATCH', body: JSON.stringify(data) }),

  batchEvents: (sessionId: string, events: { event_type: string; timestamp: string; metadata?: Record<string, unknown> }[]) =>
    request<{ status: string; count: number }>(`/api/sessions/${sessionId}/events`, { method: 'POST', body: JSON.stringify({ events }) }),

  // Analytics
  /** Seguimiento del grupo en vivo (solo docentes y administradores). */
  getMonitor: () => request<Record<string, unknown>>('/api/analytics/monitor'),

  getClassAnalytics: () =>
    request<{
      student_count: number;
      phase_a_completed: number;
      avg_jol: number;
      avg_gap: number;
      calibrated_count: number;
      cluster_distribution: Record<string, number>;
      cluster_students: Record<string, {
        id: string; name: string; initials: string; email: string;
        jol: number | null; performance: number | null; gap: number | null;
        calibration_index: number | null; cluster: string | null;
      }[]>;
      urgent_alerts: {
        id: string; name: string; initials: string; email: string;
        jol: number | null; performance: number | null; gap: number | null;
        reason: string; type: string;
      }[];
    }>('/api/analytics/class'),

  getStudentAnalytics: (userId: string) =>
    request<Record<string, unknown>>(`/api/analytics/student/${userId}`),

  getExperimentAnalytics: (experimentId: string) =>
    request<Record<string, unknown>>(`/api/analytics/experiment/${experimentId}`),

  // Experiments
  getExperiments: () =>
    request<Record<string, unknown>[]>('/api/experiments/'),

  assignToExperiment: (experimentId: string, data: { user_id: string; group_name?: string }) =>
    request<{ status: string; group?: string }>(`/api/experiments/${experimentId}/assign`, { method: 'POST', body: JSON.stringify(data) }),
};


// ---------------------------------------------------------------------------
// Tipos del sistema tutor
// ---------------------------------------------------------------------------
export type TutorLevel = 'basico' | 'medio' | 'avanzado';

export interface TutorCriterion {
  id: string; level: TutorLevel; dimension: string; phase: string; text: string; evidence: string; next_step: string; achieved: string;
}

export interface TutorDomain {
  levels: TutorLevel[];
  level_labels: Record<TutorLevel, string>;
  dimensions: Record<string, string>;
  criteria: TutorCriterion[];
  indicators: { id: string; text: string; source: string; criteria: string[]; p: Record<TutorLevel, number> }[];
  blocking_prior: number;
  blocking_signals: Record<string, { blocked: number; flowing: number }>;
  scaffold_ladder: { level: string; name: string; min_p: number; max_p: number; tactic: string; requires_consecutive?: number; on_request_only?: boolean }[];
  tactics: Record<string, string>;
  thresholds: Record<string, number>;
  tech_ladder: string[];
  components: Record<string, string>;
  strategies: Record<string, string>;
}

export interface LearningStyle {
  visual_verbal: number; global_sequential: number; label: string; answers?: Record<string, unknown>;
}

export interface CriterionSummary {
  level: TutorLevel; dimension: string; text: string; p: number; ci: [number, number]; n: number; mastered: boolean; faded: boolean;
}

export interface TechOverlay {
  [component: string]: { name: string; steps: Record<string, { p: number; n: number; status: 'dominado' | 'en_proceso' | 'pendiente' }>; zdp_step: string };
}

export interface TutorZdp {
  consolidated: TutorLevel | null; zdp: TutorLevel; zdp_label: string; pending_criteria: string[]; fading: boolean;
}

export interface TutorScaffold {
  zdp: TutorLevel; type: 'conciencia' | 'monitoreo' | 'transferencia'; mandatory_checkpoints: boolean; ask_before_hint: boolean; messages: string[];
  /** Ajustes que el perfil dinámico hizo sobre el andamiaje base de la ZDP. */
  personalized?: string[]; blocking_prior?: number; focus_trait?: string | null;
}

/** Perfil dinámico del estudiante (backend: services/tutor/profile.py). */
export interface LearnerProfile {
  challenges: number;
  calibration: { bias_mean: number; bias_sd: number; n: number; probs: { over: number; cal: number; sub: number }; class: 'over' | 'cal' | 'sub' };
  traits: Record<string, { label: string; p: number; ci: [number, number]; evidence: number; status: 'sin_datos' | 'a_trabajar' | 'en_desarrollo' | 'fortaleza' }>;
  weakest_trait: string | null;
  blocking_prior: number;
  pace_ratio: number | null;
}

export interface TutorState {
  user_id: string; group: string; zdp: TutorZdp; criteria: Record<string, CriterionSummary>; overlay: TechOverlay;
  learning_style: LearningStyle | null; last_profile: string | null; last_bias: number | null; last_strategy: string | null;
  strategies: Record<string, Record<string, [number, number]>>; challenges_done: string[];
  history: { session_id: string; challenge_id: string; level: TutorLevel; posterior: Record<TutorLevel, number>; bias: number | null; score?: number; passed: boolean; zdp: TutorLevel; criteria: Record<string, boolean>; at?: string; attempts?: number | null; trial_and_error?: number | null }[];
  scaffold: TutorScaffold;
  profile?: LearnerProfile;
}

export interface TutorPlan {
  group: string; zdp: TutorZdp;
  challenge: { challenge_id: string | null; reason: string; alternatives: { id: string; p_dominio: number; unlocked: boolean }[]; p_dominio?: number };
  strategy: { strategy_id: string; method: 'thompson' | 'aleatoria'; profile: string; reason: string; samples: Record<string, number> };
  scaffold: TutorScaffold; overlay: TechOverlay; profile?: LearnerProfile;
}

export interface TutorPhaseCResult {
  group: string;
  reading: { posterior: Record<TutorLevel, number>; level: TutorLevel; level_label: string; contributions: { indicator: string; weight: number; text: string }[]; missing_for_next: { indicator: string; text: string }[] };
  indicators: Record<string, boolean | null>;
  text_analysis: { f1: boolean; f2: boolean; f3: boolean; f4: boolean; experience_cited: boolean; reflection_words: number; anchor_similarity: Record<string, number> };
  criteria_observed: Record<string, boolean | null>;
  newly_mastered: string[];
  zdp_before: TutorZdp; zdp_after: TutorZdp;
  criteria: Record<string, CriterionSummary>;
  strategy_outcome: { strategy_id: string; profile: string; success: boolean; prev_bias: number; bias: number } | null;
  feedback: { message: string; achieved_criterion: string | null; next_criterion: string | null; newly_mastered: string[]; level_change: string | null; reading_sentence: string };
  overlay: TechOverlay;
  profile?: LearnerProfile;
}

export interface ClassMap {
  students: { user_id: string; name: string; email: string; zdp: TutorLevel; consolidated: TutorLevel | null; pending: string[]; criteria: Record<string, number>; tech: Record<string, string>; last_profile: string | null; last_bias: number | null; learning_style: string | null; challenges_done: number; last_reading: TutorLevel | null }[];
  by_zdp: Record<TutorLevel, number>;
  levels: Record<TutorLevel, string>;
  criteria: TutorCriterion[];
}

// ---------------------------------------------------------------------------
// Panel del administrador: intervenciones del tutor
// ---------------------------------------------------------------------------
export type InterventionKind = 'pista' | 'pista_auto' | 'andamiaje' | 'punto_control' | 'replanificacion' | 'freno';

export interface TutorIntervention {
  id: string; kind: InterventionKind; level: string | number | null; tactic: string | null;
  initiator: 'tutor' | 'estudiante'; t_seconds: number | null; p_block: number | null; detail: string | null;
  challenge_id: string; session_id: string; timestamp: string | null; response: string | null;
}

export interface TutorAdminStudentRow {
  id: string; name: string; email: string; active_now: boolean; zdp: TutorLevel | null; learning_style: string | null;
  last_profile: string | null; last_bias: number | null; activities: number; completed: number; passed: number;
  interventions: number; per_activity: number | null; by_kind: Record<InterventionKind, number>;
  with_help: number; passed_with_help: number; overrides: number; last_intervention: string | null;
}

export interface TutorAdminOverview {
  generated_at: string;
  kinds: InterventionKind[];
  summary: {
    students: number; active_now: number; activities: number; interventions: number; per_activity: number | null;
    activities_with_help: number; pass_rate_helped: number | null; pass_rate_unhelped: number | null;
    by_initiator: Record<string, number>; overrides: number; last_hour: number;
  };
  by_kind: Record<InterventionKind, number>;
  ladder: Record<string, number>;
  students: TutorAdminStudentRow[];
  challenges: { challenge_id: string; attempts: number; interventions_per_attempt: number; hints_per_attempt: number; replans: number; pass_rate: number | null; pass_rate_helped: number | null; pass_rate_unhelped: number | null }[];
  feed: (TutorIntervention & { student_id: string; student: string })[];
}

export type TutorAdminAnswer = string | number | boolean | null | (string | number | boolean | null)[] | Record<string, unknown>;
export interface TutorAdminAttempt {
  t_seconds: number | null; correct: boolean; partial: boolean; item: string | number | null; answer: TutorAdminAnswer;
  delta: number | null; confidence: number | null; secs_since_feedback: number | null; trial_and_error: boolean;
  hints_before: number[]; latency_s: number | null;
}

export interface TutorAdminActivity {
  session_id: string; challenge_id: string; started_at: string | null; completed_at: string | null; strategy_id: string | null;
  result: { score: number | null; passed: boolean; time_spent_seconds: number; attempts: number; hints_used: number; clicks: number } | null;
  calibration: { jol: number | null; performance: number | null; gap: number | null; cluster: string; calibration_index: number | null; banda?: string; bias_index?: number } | null;
  reading: TutorPhaseCResult['reading'] | null;
  feedback: TutorPhaseCResult['feedback'] | null;
  reflection_text: string | null;
  plan: { strategy: TutorPlan['strategy'] | null; challenge_reason: string | null; group: string | null } | null;
  overrides: { kind: string; chosen: string | null; suggested: string | null; reason: string | null; at: string | null }[];
  interventions: TutorIntervention[];
  /** Qué respondió y cómo (eventos ATTEMPT de la Fase B). */
  attempts?: TutorAdminAttempt[];
  affect?: { t_seconds: number | null; affect: string; p_block: number | null; scaffold: string | null }[];
  counts: Record<InterventionKind, number>;
  total_interventions: number;
  ladder: Record<string, number>;
}

export interface TutorAdminStudent {
  student: { id: string; name: string; email: string; created_at: string | null };
  tutor: {
    zdp: TutorZdp; criteria: Record<string, { p: number; n: number; mastered: boolean; level: TutorLevel; text: string }>;
    overlay: Record<string, string>; learning_style: LearningStyle | null; last_profile: string | null; last_bias: number | null; last_strategy: string | null;
  };
  summary: { activities: number; completed: number; passed: number; interventions: number; per_activity: number | null; by_kind: Record<InterventionKind, number>; by_initiator: Record<string, number>; ladder: Record<string, number>; overrides: number };
  kinds: InterventionKind[];
  criteria_order: string[];
  activities: TutorAdminActivity[];
}
