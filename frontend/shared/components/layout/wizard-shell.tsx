"use client";

import { useWizardStore } from "@/shared/store/wizard-store";
import { useRouter, usePathname } from "next/navigation";
import { Check, Lock } from "lucide-react";

const STEPS = [
  { number: 1, label: "Gaya Belajar", path: "/gaya-belajar" },
  { number: 2, label: "Pekerjaan Impian", path: "/pekerjaan-impian" },
  { number: 3, label: "Input Skill", path: "/input-skill" },
  { number: 4, label: "Hasil Analisis", path: "/hasil-analisis" },
];

export function WizardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { completedSteps, isStepAccessible } = useWizardStore();

  const currentStepIndex = STEPS.findIndex((s) => s.path === pathname);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700">
      {/* Step Indicator */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const isCompleted = completedSteps.includes(step.number);
              const isCurrent = currentStepIndex === i;
              const accessible = isStepAccessible(step.number);

              return (
                <div key={step.number} className="flex items-center">
                  <button
                    onClick={() => accessible && router.push(step.path)}
                    disabled={!accessible}
                    className={`flex items-center gap-1.5 transition-all ${
                      isCurrent
                        ? "text-white font-semibold"
                        : isCompleted
                          ? "text-white/90 cursor-pointer hover:text-white"
                          : "text-white/40 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? "bg-green-400 text-green-900"
                          : isCurrent
                            ? "bg-white text-indigo-700"
                            : "bg-white/20 text-white/50"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : !accessible ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className="hidden sm:inline text-sm">
                      {step.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                        completedSteps.includes(step.number)
                          ? "bg-green-400"
                          : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
