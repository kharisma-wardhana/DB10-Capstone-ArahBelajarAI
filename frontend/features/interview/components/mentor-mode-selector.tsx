"use client";

import { MessageSquare, Compass, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import type { MentorMode } from "@/shared/api/types";

interface ModeOption {
  mode: MentorMode;
  label: string;
  description: string;
  icon: typeof MessageSquare;
}

const MODES: ModeOption[] = [
  {
    mode: "interview",
    label: "Mock Interview",
    description: "Latihan wawancara 5 pertanyaan",
    icon: MessageSquare,
  },
  {
    mode: "career_advice",
    label: "Konsultasi Karir",
    description: "Saran transisi karir personal",
    icon: Compass,
  },
  {
    mode: "learning_coach",
    label: "Rencana Belajar",
    description: "Rencana mingguan dari coach AI",
    icon: CalendarDays,
  },
];

interface MentorModeSelectorProps {
  onSelect: (mode: MentorMode) => void;
  hasGapResult: boolean;
}

export function MentorModeSelector({
  onSelect,
  hasGapResult,
}: Readonly<MentorModeSelectorProps>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-brand-text text-2xl font-bold mb-2">MentorAI</h2>
        <p className="text-brand-text-muted text-sm max-w-sm">
          Pilih mode mentoring yang kamu butuhkan. AI mentor memiliki akses
          penuh ke profil dan analisis skill kamu.
        </p>
      </motion.div>

      <div className="grid gap-3 w-full max-w-md">
        {MODES.map((opt, idx) => {
          const Icon = opt.icon;
          const needsContext = opt.mode !== "interview" && !hasGapResult;

          return (
            <motion.button
              key={opt.mode}
              onClick={() => !needsContext && onSelect(opt.mode)}
              disabled={needsContext}
              className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                needsContext
                  ? "opacity-40 cursor-not-allowed bg-brand-card/30 border-brand-card-border"
                  : "bg-brand-card border-brand-card-border hover:border-brand-primary/50 hover:bg-brand-card-hover"
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileTap={needsContext ? {} : { scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-primary-light" />
                </div>
                <div>
                  <div className="text-brand-text text-sm font-semibold">
                    {opt.label}
                  </div>
                  <div className="text-brand-text-muted text-xs">
                    {needsContext
                      ? "Selesaikan analisis skill gap terlebih dahulu"
                      : opt.description}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
