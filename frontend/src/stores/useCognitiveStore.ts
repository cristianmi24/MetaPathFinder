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
    [key: string]: any;
  };
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
  
  // Actions
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  addEvent: (type: string, metadata?: any) => void;
  updateCognitiveMetrics: (load: number, calibration: number, score?: number) => void;
  setCognitiveState: (state: CognitiveState) => void;
  flushEvents: () => Promise<void>;
  reset: () => void;
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
          lastEventTime: Date.now()
        });
      }
    }),
    {
      name: 'meta-pathfinder-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
