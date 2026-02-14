"use client";

import { Badge } from "@/components/ui/badge";
import type { InterviewFeedbackResponse } from "@/shared/api/types";

interface FeedbackSummaryProps {
  feedback: InterviewFeedbackResponse;
}

const QUALITY_LABELS: Record<string, { label: string; className: string }> = {
  good: {
    label: "Baik",
    className: "bg-green-500/20 text-green-300 border-green-500/30",
  },
  average: {
    label: "Cukup",
    className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
  needs_improvement: {
    label: "Perlu Perbaikan",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
  },
};

export function FeedbackSummary({ feedback }: FeedbackSummaryProps) {
  const scoreColor =
    feedback.overall_score >= 70
      ? "text-green-400"
      : feedback.overall_score >= 40
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="space-y-5">
      {/* Overall Score */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
        <div className="text-white/50 text-sm mb-1">Skor Keseluruhan</div>
        <div className={`text-5xl font-bold ${scoreColor}`}>
          {Math.round(feedback.overall_score)}
        </div>
        <div className="text-white/40 text-sm">dari 100</div>
      </div>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5">
          <h3 className="text-green-400 font-semibold text-sm mb-3">
            Kekuatan
          </h3>
          <ul className="space-y-2">
            {feedback.strengths.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-white/80 text-sm"
              >
                <span className="text-green-400 mt-0.5">&#10003;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5">
          <h3 className="text-yellow-400 font-semibold text-sm mb-3">
            Area Perbaikan
          </h3>
          <ul className="space-y-2">
            {feedback.improvements.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-white/80 text-sm"
              >
                <span className="text-yellow-400 mt-0.5">!</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Question Summaries */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">
          Detail per Pertanyaan
        </h3>
        <div className="space-y-3">
          {feedback.question_summaries.map((q, i) => {
            const quality = QUALITY_LABELS[q.answer_quality] || QUALITY_LABELS.average;
            return (
              <div
                key={i}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white/90 text-sm font-medium flex-1">
                    {q.question}
                  </p>
                  <Badge className={quality.className}>{quality.label}</Badge>
                </div>
                <p className="text-white/60 text-xs">{q.tip}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
