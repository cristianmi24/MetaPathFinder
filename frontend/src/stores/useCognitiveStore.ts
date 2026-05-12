import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type CognitiveState = 'Flow' | 'Frustration' | 'Boredom' | 'Confusion' | 'Focus' | 'Distraction' | 'Metacognitive_Mismatch';
export type UserRole = 'student' | 'admin' | null;

export interface User {
  name: string;
  lastName: string;
  email: string;
}

export const stateTranslations: Record<CognitiveState, string> = {
  Flow: 'Flujo Óptimo',
  Frustration: 'Frustración',
  Boredom: 'Aburrimiento',
  Confusion: 'Confusión',
  Focus: 'Enfoque',
  Distraction: 'Distracción',
  Metacognitive_Mismatch: 'Desajuste Metacognitivo'
};

interface CognitiveEvent {
  id: string;
  type: string;
  timestamp: number;
  metadata?: {
    state?: CognitiveState;
    calibration?: number;
    load?: number;
    score?: number;
    theme?: string;
    latent_strategy?: string;
    strategy_id?: string;
    transfer_readiness?: number;
    source_domain?: string;
    processing_latency?: string;
    calibration_error?: number;
    is_reflexive_brake?: boolean;
    clicks?: number;
    pageNavigation?: boolean;
    questionNumber?: number;
    timeSpent?: number;
    correct?: boolean;
    [key: string]: any;
  };
}

export interface StudentResult {
  id: string;
  name: string;
  email: string;
  testDate: number;
  status: 'completed' | 'in-progress' | 'pending';
  totalTime: number;
  totalClicks: number;
  pageNavigations: number;
  score: number;
  events: CognitiveEvent[];
}

interface CognitiveStore {
  userId: string;
  role: UserRole;
  state: CognitiveState;
  cognitiveLoad: number; // 0 to 1
  calibration: number; // 0 to 1
  events: CognitiveEvent[];
  latentStrategies: string[];
  transferReadiness: number;
  lastEventTime: number;
  user: User | null;
  
  // Multi-student tracking
  students: StudentResult[];
  currentTestSession: { studentId: string; startTime: number; } | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  addEvent: (type: string, metadata?: any) => void;
  updateCognitiveMetrics: (load: number, calibration: number, score?: number) => void;
  setCognitiveState: (state: CognitiveState) => void;
  flushEvents: () => Promise<void>;
  reset: () => void;
  
  // Student management
  registerStudent: (student: Omit<StudentResult, 'id' | 'events'>) => void;
  startTestSession: (studentId: string) => void;
  endTestSession: (studentId: string, score: number) => void;
  addStudentEvent: (studentId: string, event: CognitiveEvent) => void;
  getStudentResults: () => StudentResult[];
  getStudentById: (studentId: string) => StudentResult | undefined;
  
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Seguimiento de retos
  currentLevel: number;
  currentChallengeId: string | null;
  setCurrentLevel: (level: number) => void;
  setCurrentChallengeId: (id: string | null) => void;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  removeStudent: (id: string) => void;
  consolidateSession: () => void;
}

export const useCognitiveStore = create<CognitiveStore>()(
  persist(
    (set, get) => ({
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      role: null,
      state: 'Flow',
      cognitiveLoad: 0.45,
      calibration: 0.82,
      events: [],
      latentStrategies: [],
      transferReadiness: 0.5,
      lastEventTime: Date.now(),
      user: null,
      students: [],
      currentTestSession: null,
      isSidebarCollapsed: false,
      currentLevel: 1,
      currentChallengeId: null,
      currentSessionId: null,
      setCurrentLevel: (level) => set({ currentLevel: level }),
      setCurrentChallengeId: (id) => set({ currentChallengeId: id }),
      setCurrentSessionId: (id) => set({ currentSessionId: id }),

      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),

      addEvent: (type, metadata) => {
        const now = Date.now();
        const lastTime = get().lastEventTime;
        const durationSinceLast = now - lastTime;
        
        // Metacognitive Brake: Dynamic threshold based on task type
        // For QUIZ_ANSWER (complex), we expect > 5s. For UI_CLICK (simple), > 1s.
        const threshold = type === 'QUIZ_ANSWER' ? 5000 : 1000;
        const isReflexiveBrake = (type === 'UI_CLICK' || type === 'QUIZ_ANSWER') && durationSinceLast < threshold;
        
        let enhancedMetadata = { ...metadata };
        if (isReflexiveBrake) {
          enhancedMetadata.is_reflexive_brake = true;
          enhancedMetadata.processing_latency = `${(durationSinceLast / 1000).toFixed(1)}s`;
          
          // Cognitive Priming (Inyector de Heurísticas)
          const strategies = get().latentStrategies;
          if (strategies.length > 0) {
            enhancedMetadata.transfer_prompt = `Detección de Primado Cognitivo: Has respondido en tiempo récord. ¿Estás aplicando la heurística transversal de ${strategies[strategies.length-1]}?`;
          }
        }

        const newEvent = {
          id: uuidv4(),
          type,
          timestamp: now,
          metadata: enhancedMetadata
        };

        // Track clicks if applicable
        if (type === 'UI_CLICK') {
          enhancedMetadata.clicks = (enhancedMetadata.clicks || 0) + 1;
        }

        // If it's a successful evaluation, update latent strategies
        if (type === 'EVALUATION_COMPLETED' && metadata?.score > 80) {
          const newStrategyId = metadata.theme === 'Meta-Cognición' ? 'SYSTEMATIC_VERIFICATION' : 'STRUCTURAL_MAPPING';
          const currentStrategies = get().latentStrategies;
          if (!currentStrategies.includes(newStrategyId)) {
            set({ 
              latentStrategies: [...currentStrategies, newStrategyId],
              transferReadiness: Math.min(1, get().transferReadiness + 0.1)
            });
          }
        }

        set((state) => ({ 
          events: [...state.events.slice(-99), newEvent],
          lastEventTime: now
        }));

        // Also add to current test session if active
        const session = get().currentTestSession;
        if (session) {
          get().addStudentEvent(session.studentId, newEvent);
        }
      },

      updateCognitiveMetrics: (load, calibration, score) => {
        let newState = get().state;
        
        // Detection of Metacognitive Mismatch: High score but low calibration/consciousness
        if (score && score > 80 && calibration < 0.65) {
          newState = 'Metacognitive_Mismatch';
        } else if (load > 0.8) {
          newState = 'Frustration';
        } else if (load < 0.2) {
          newState = 'Boredom';
        } else if (calibration > 0.8 && load > 0.4 && load < 0.7) {
          newState = 'Flow';
        }

        set({ cognitiveLoad: load, calibration, state: newState });
      },

      setCognitiveState: (state) => {
        set({ state });
      },

      flushEvents: async () => {
        const { events, userId } = get();
        if (events.length === 0) return;

        try {
          await fetch('/api/tracking/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, events })
          });
          // Note: In real app we might clear, but for local persistence feel, 
          // we might want to keep a history. For now, clear to follow original logic.
          set({ events: [] });
        } catch (err) {
          console.error('Failed to flush cognitive events', err);
        }
      },

      removeStudent: (id) => {
        set((state) => ({
          students: state.students.filter(s => s.id !== id)
        }));
      },

      registerStudent: (student) => {
        const newStudent: StudentResult = {
          ...student,
          id: uuidv4(),
          events: [],
          status: 'pending'
        };
        set((state) => ({
          students: [...state.students, newStudent]
        }));
      },

      startTestSession: (studentId: string) => {
        set({
          currentTestSession: {
            studentId,
            startTime: Date.now()
          }
        });
      },

      endTestSession: (studentId: string, score: number) => {
        set((state) => {
          const updatedStudents = state.students.map((s) => {
            if (s.id === studentId) {
              const startTime = state.currentTestSession?.startTime || Date.now();
              const totalTime = Math.round((Date.now() - startTime) / 1000);
              const pageNavs = s.events.filter(e => e.metadata?.pageNavigation).length;
              const clicks = s.events.reduce((acc, e) => acc + (e.metadata?.clicks || 0), 0);

              return {
                ...s,
                status: 'completed' as const,
                totalTime,
                totalClicks: clicks,
                pageNavigations: pageNavs,
                score,
                testDate: Date.now()
              };
            }
            return s;
          });

          return {
            students: updatedStudents,
            currentTestSession: null
          };
        });
      },

      addStudentEvent: (studentId: string, event: CognitiveEvent) => {
        set((state) => ({
          students: state.students.map((s) => {
            if (s.id === studentId) {
              return {
                ...s,
                events: [...s.events.slice(-99), event]
              };
            }
            return s;
          })
        }));
      },

      getStudentResults: () => {
        return get().students;
      },

      getStudentById: (studentId: string) => {
        return get().students.find(s => s.id === studentId);
      },

      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

      consolidateSession: () => {
        console.log('🏁 Consolidando sesión (Upsert)...');
        const { events, user } = get();
        if (events.length === 0 || !user) return;

        const challengeEvents = events.filter(e => e.type === 'CHALLENGE_COMPLETED');
        if (challengeEvents.length === 0) return;

        // Tomamos el último evento para tener las métricas más actuales
        const lastChallenge = challengeEvents[challengeEvents.length - 1].metadata;
        const jolAnswers = lastChallenge.jolAnswers || {};
        const jolValues = Object.values(jolAnswers) as number[];
        const jolAvg = jolValues.length > 0 ? jolValues.reduce((a, b) => a + b, 0) / jolValues.length : 5;
        const score = lastChallenge.технические_метрики?.score || 0;
        const performance = score / 10;
        const gap = jolAvg - performance;

        let cluster: 'over' | 'sub' | 'cal' = 'cal';
        if (gap > 2) cluster = 'over';
        else if (gap < -2) cluster = 'sub';

        const studentEmail = user.email || 'anon@example.com';
        const currentSessionId = get().currentSessionId;
        
        // Calcular tiempo total acumulado de todos los retos completados en esta sesión
        const totalSessionTime = challengeEvents.reduce((acc, e) => acc + (e.metadata.biometricas?.total_time || 0), 0);
        
        // Desglose por fases (asumiendo que cada evento CHALLENGE_COMPLETED representa una fase/reto)
        const phaseTimes = challengeEvents.map((e, idx) => ({
          label: `Fase ${idx + 1}`,
          seconds: e.metadata.biometricas?.total_time || 0
        }));

        set((state) => {
          // Intentar encontrar por ID de sesión única en lugar de email para permitir historial
          const existingIndex = currentSessionId ? state.students.findIndex(s => s.id === currentSessionId) : -1;
          
          const studentId = currentSessionId || `${user.name?.substring(0, 2).toUpperCase() || 'ST'}-${Math.floor(Math.random() * 1000)}`;
          
          const studentData: StudentResult = {
            id: studentId,
            name: `${user.name || 'Estudiante'} ${user.lastName || ''}`.trim(),
            email: studentEmail,
            testDate: Date.now(),
            status: 'completed',
            totalTime: totalSessionTime,
            totalClicks: lastChallenge.biometricas?.clicks || 0,
            pageNavigations: 1,
            score: score,
            events: [...events],
            metadata: {
              cluster,
              jol: jolAvg,
              nota: performance,
              desfase: gap,
              err: (100 - score),
              tiempo: Math.round(totalSessionTime / 60),
              urgent: gap > 3 || score < 40,
              mouseHistory: lastChallenge.biometricas?.mouse_history || [],
              phaseTimes: phaseTimes
            }
          } as any;

          if (existingIndex >= 0) {
            // Actualizar existente
            const updatedStudents = [...state.students];
            updatedStudents[existingIndex] = studentData;
            console.log('🔄 Estudiante actualizado:', studentEmail);
            return { students: updatedStudents };
          } else {
            // Añadir nuevo
            console.log('🆕 Nuevo estudiante consolidado:', studentEmail);
            return { students: [studentData, ...state.students].slice(0, 200) };
          }
        });
      },

      reset: () => {
        set({
          role: null,
          user: null,
          state: 'Flow',
          cognitiveLoad: 0.45,
          calibration: 0.82,
          events: [],
          latentStrategies: [],
          transferReadiness: 0.5,
          lastEventTime: Date.now(),
          currentTestSession: null,
          currentSessionId: null,
          currentLevel: 1
        });
      }
    }),
    {
      name: 'meta-pathfinder-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
