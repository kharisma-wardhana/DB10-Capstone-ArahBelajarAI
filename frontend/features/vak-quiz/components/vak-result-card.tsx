"use client";

import type { VakResult } from "@/shared/store/wizard-store";
import { VAK_TIPS } from "../data/vak-questions";
import { Progress } from "@/components/ui/progress";

interface VakResultCardProps {
  result: VakResult;
}

export function VakResultCard({ result }: VakResultCardProps) {
  const tipData = VAK_TIPS[result.dominant];
  const total = result.scores.visual + result.scores.auditory + result.scores.kinesthetic;

  const percentages = {
    visual: Math.round((result.scores.visual / total) * 100),
    auditory: Math.round((result.scores.auditory / total) * 100),
    kinesthetic: Math.round((result.scores.kinesthetic / total) * 100),
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg space-y-6">
      {/* Dominant Style */}
      <div className="text-center">
        <div className="text-4xl mb-2">{tipData.emoji}</div>
        <h3 className="text-white text-xl font-bold mb-1">
          Gaya Belajar Kamu: {tipData.label}
        </h3>
        <p className="text-white/60 text-sm">
          Berdasarkan jawabanmu, kamu cenderung belajar paling efektif dengan
          gaya {tipData.label.toLowerCase()}.
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3">
        {(["visual", "auditory", "kinesthetic"] as const).map((style) => {
          const info = VAK_TIPS[style];
          return (
            <div key={style} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">
                  {info.emoji} {info.label}
                </span>
                <span className="text-white/60">{percentages[style]}%</span>
              </div>
              <Progress
                value={percentages[style]}
                className="h-2 bg-white/10"
              />
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div>
        <h4 className="text-white font-semibold text-sm mb-3">
          Tips Belajar untuk Kamu:
        </h4>
        <ul className="space-y-2">
          {tipData.tips.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-white/80 text-sm"
            >
              <span className="text-green-400 mt-0.5">&#10003;</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
