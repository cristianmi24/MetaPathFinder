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

  const res = await requestWithTimeout(url, { headers, ...options }, REQUEST_TIMEOUT_MS);
  if (res.status === 401) {
    // Only clear auth state, preserve other data
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
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string; user: { id: string; name: string; last_name: string; email: string; role: string; created_at: string } }>(
      '/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  register: (data: { name: string; last_name: string; email: string; password: string; role?: string; terms_accepted: boolean }) =>
    request<{ id: string; name: string; last_name: string; email: string; role: string; created_at: string }>(
      '/api/auth/register', { method: 'POST', body: JSON.stringify(data) }
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
    jols: { tipo: string; valor: number | string; tiempo_maximo?: number }[];
    actual_scores: number[];
    reflection_text?: string | null;
    cognitive_events?: { event_type: string; timestamp: string; metadata?: Record<string, unknown> }[];
  }) => request<{ status: string; session_id: string; calibration: Record<string, unknown> }>('/api/phase-c/complete', { method: 'POST', body: JSON.stringify(data) }),

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
