import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LearningStyle, TutorDomain, TutorPhaseCResult, TutorPlan, TutorState } from '../services/api';

export type PresentationMode = 'visual' | 'verbal';
export type NavigationMode = 'global' | 'secuencial';

/** Registro de una pista o táctica mostrada (para curaduría y explicabilidad). */
export interface ShownResource {
  id: string;
  challengeId: string;
  level: 1 | 2 | 3;
  tactic: string;
  at: number;
}

interface TutorStore {
  domain: TutorDomain | null;
  state: TutorState | null;
  plan: TutorPlan | null;
  lastPhaseC: TutorPhaseCResult | null;
  learningStyle: LearningStyle | null;
  presentationMode: PresentationMode | null;
  navigationMode: NavigationMode | null;
  freeNavigationUnlocked: boolean;
  /** Latencias (s) de las respuestas del estudiante en la sesión, para el freno personalizado. */
  latencySamples: number[];
  shownResources: ShownResource[];
  dismissedStyleQuiz: boolean;

  setDomain: (d: TutorDomain) => void;
  setState: (s: TutorState | null) => void;
  setPlan: (p: TutorPlan | null) => void;
  setLastPhaseC: (r: TutorPhaseCResult | null) => void;
  setLearningStyle: (ls: LearningStyle | null) => void;
  setPresentationMode: (m: PresentationMode) => void;
  setNavigationMode: (m: NavigationMode) => void;
  unlockFreeNavigation: () => void;
  pushLatency: (seconds: number) => void;
  resetLatencies: () => void;
  recordShownResource: (r: Omit<ShownResource, 'at'>) => void;
  setDismissedStyleQuiz: (v: boolean) => void;
}

export const useTutorStore = create<TutorStore>()(
  persist(
    (set) => ({
      domain: null,
      state: null,
      plan: null,
      lastPhaseC: null,
      learningStyle: null,
      presentationMode: null,
      navigationMode: null,
      freeNavigationUnlocked: false,
      latencySamples: [],
      shownResources: [],
      dismissedStyleQuiz: false,

      setDomain: (domain) => set({ domain }),
      setState: (state) => set({ state, learningStyle: state?.learning_style ?? null }),
      setPlan: (plan) => set({ plan }),
      setLastPhaseC: (lastPhaseC) => set({ lastPhaseC }),
      setLearningStyle: (learningStyle) => set((s) => ({
        learningStyle,
        presentationMode: s.presentationMode ?? (learningStyle ? (learningStyle.visual_verbal >= 0 ? 'visual' : 'verbal') : null),
        navigationMode: s.navigationMode ?? (learningStyle ? (learningStyle.global_sequential >= 0 ? 'global' : 'secuencial') : null),
      })),
      setPresentationMode: (presentationMode) => set({ presentationMode }),
      setNavigationMode: (navigationMode) => set({ navigationMode }),
      unlockFreeNavigation: () => set({ freeNavigationUnlocked: true }),
      pushLatency: (seconds) => set((s) => ({ latencySamples: [...s.latencySamples.slice(-29), seconds] })),
      resetLatencies: () => set({ latencySamples: [] }),
      recordShownResource: (r) => set((s) => ({ shownResources: [...s.shownResources.slice(-49), { ...r, at: Date.now() }] })),
      setDismissedStyleQuiz: (dismissedStyleQuiz) => set({ dismissedStyleQuiz }),
    }),
    {
      name: 'meta-pathfinder-tutor',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        state: s.state, plan: s.plan, lastPhaseC: s.lastPhaseC, learningStyle: s.learningStyle,
        presentationMode: s.presentationMode, navigationMode: s.navigationMode,
        freeNavigationUnlocked: s.freeNavigationUnlocked, shownResources: s.shownResources,
        dismissedStyleQuiz: s.dismissedStyleQuiz, latencySamples: s.latencySamples, domain: s.domain,
      }),
    }
  )
);
