"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ExtractedSkill,
  SkillGapResponse,
} from "@/shared/api/types";

export type LearningStyle = "visual" | "auditory" | "kinesthetic";

export interface VakResult {
  dominant: LearningStyle;
  scores: { visual: number; auditory: number; kinesthetic: number };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface InterviewState {
  sessionId: string | null;
  jobRole: string;
  messages: ChatMessage[];
  questionNumber: number;
  isComplete: boolean;
}

interface WizardStore {
  // Step tracking
  currentStep: number;
  completedSteps: number[];

  // Step 1: VAK
  vakResult: VakResult | null;
  setVakResult: (result: VakResult) => void;

  // Step 2: Job
  selectedJobTitle: string | null;
  setSelectedJobTitle: (title: string) => void;

  // Step 3: Skills
  rawSkillInput: string;
  extractedSkills: ExtractedSkill[];
  setRawSkillInput: (input: string) => void;
  setExtractedSkills: (skills: ExtractedSkill[]) => void;

  // Step 4: Gap Analysis
  gapResult: SkillGapResponse | null;
  setGapResult: (result: SkillGapResponse) => void;

  // Interview
  interview: InterviewState;
  setInterview: (state: Partial<InterviewState>) => void;
  appendMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (token: string) => void;

  // Navigation
  goToStep: (step: number) => void;
  completeStep: (step: number) => void;
  isStepAccessible: (step: number) => boolean;

  // Progress
  hasProgress: () => boolean;

  // Reset
  resetAll: () => void;
}

const initialInterviewState: InterviewState = {
  sessionId: null,
  jobRole: "",
  messages: [],
  questionNumber: 0,
  isComplete: false,
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      completedSteps: [],

      vakResult: null,
      selectedJobTitle: null,
      rawSkillInput: "",
      extractedSkills: [],
      gapResult: null,
      interview: { ...initialInterviewState },

      setVakResult: (result) => set({ vakResult: result }),
      setSelectedJobTitle: (title) => set({ selectedJobTitle: title }),
      setRawSkillInput: (input) => set({ rawSkillInput: input }),
      setExtractedSkills: (skills) => set({ extractedSkills: skills }),
      setGapResult: (result) => set({ gapResult: result }),

      setInterview: (state) =>
        set({ interview: { ...get().interview, ...state } }),
      appendMessage: (msg) =>
        set({
          interview: {
            ...get().interview,
            messages: [...get().interview.messages, msg],
          },
        }),
      updateLastAssistantMessage: (token) => {
        const msgs = [...get().interview.messages];
        const last = msgs[msgs.length - 1];
        if (last?.role === "assistant") {
          last.content += token;
          set({ interview: { ...get().interview, messages: msgs } });
        }
      },

      goToStep: (step) => set({ currentStep: step }),
      completeStep: (step) =>
        set({
          completedSteps: [...new Set([...get().completedSteps, step])],
          currentStep: step + 1,
        }),
      isStepAccessible: (step) => {
        if (step === 1) return true;
        return get().completedSteps.includes(step - 1);
      },

      hasProgress: () => get().completedSteps.length > 0,

      resetAll: () =>
        set({
          currentStep: 1,
          completedSteps: [],
          vakResult: null,
          selectedJobTitle: null,
          rawSkillInput: "",
          extractedSkills: [],
          gapResult: null,
          interview: { ...initialInterviewState },
        }),
    }),
    {
      name: "arahbelajar-wizard",
    },
  ),
);
