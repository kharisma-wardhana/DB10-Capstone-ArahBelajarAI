"use client";

import { useWizardStore } from "@/shared/store/wizard-store";
import { useRouter, usePathname } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/shared/components/theme-toggle";

const STEPS = [
  { number: 1, label: "Gaya Belajar", short: "Quiz", path: "/gaya-belajar" },
  { number: 2, label: "Pekerjaan Impian", short: "Job", path: "/pekerjaan-impian" },
  { number: 3, label: "Input Skill", short: "Skill", path: "/input-skill" },
  { number: 4, label: "Hasil Analisis", short: "Hasil", path: "/hasil-analisis" },
];

function getStepTextClass(isCurrent: boolean, isCompleted: boolean) {
  if (isCurrent) return "text-brand-text font-semibold";
  if (isCompleted) return "text-brand-text/90 cursor-pointer hover:text-brand-text";
  return "text-brand-text/40 cursor-not-allowed";
}

function getStepCircleClass(isCurrent: boolean, isCompleted: boolean) {
  if (isCompleted) return "bg-brand-success text-white";
  if (isCurrent) return "bg-brand-cta-bg text-brand-cta-text";
  return "bg-brand-card border border-brand-card-border text-brand-text/50";
}

function StepIcon({ step, isCompleted, accessible }: Readonly<{ step: (typeof STEPS)[number]; isCompleted: boolean; accessible: boolean }>) {
  if (isCompleted) return <Check className="w-4 h-4" />;
  if (accessible) return <>{step.number}</>;
  return <Lock className="w-3 h-3" />;
}

export function WizardShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { completedSteps, isStepAccessible } = useWizardStore();

  const currentStepIndex = STEPS.findIndex((s) => s.path === pathname);
  const progressPercent = Math.round((completedSteps.length / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-gradient-start to-brand-gradient-end">
      {/* Step Indicator */}
      <div className="sticky top-0 z-10 pt-safe backdrop-blur-xl bg-brand-card border-b border-brand-card-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Top row: steps + theme toggle */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center justify-between">
              {STEPS.map((step, i) => {
                const isCompleted = completedSteps.includes(step.number);
                const isCurrent = currentStepIndex === i;
                const accessible = isStepAccessible(step.number);

                return (
                  <div key={step.number} className="flex items-center">
                    <button
                      onClick={() => accessible && router.push(step.path)}
                      disabled={!accessible}
                      className={`flex items-center gap-1.5 transition-all ${getStepTextClass(isCurrent, isCompleted)}`}
                    >
                      <motion.div
                        layout
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${getStepCircleClass(isCurrent, isCompleted)}`}
                      >
                        <StepIcon step={step} isCompleted={isCompleted} accessible={accessible} />
                      </motion.div>
                      <span className="text-xs sm:text-sm">
                        <span className="sm:hidden">{step.short}</span>
                        <span className="hidden sm:inline">{step.label}</span>
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`w-4 sm:w-10 h-0.5 mx-1 sm:mx-2 transition-colors ${
                          isCompleted ? "bg-brand-success" : "bg-brand-card-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <ThemeToggle />
          </div>

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-brand-card-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-brand-success"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-brand-text-muted text-xs whitespace-nowrap">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-safe">{children}</div>
    </div>
  );
}
