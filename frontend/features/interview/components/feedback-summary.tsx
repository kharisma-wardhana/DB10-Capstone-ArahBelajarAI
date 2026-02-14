"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { InterviewFeedbackResponse } from "@/shared/api/types";

interface FeedbackSummaryProps {
  feedback: InterviewFeedbackResponse;
}

const QUALITY_LABELS: Record<string, { label: string; className: string }> = {
  good: {
    label: "Baik",
    className: "bg-brand-secondary/20 text-brand-secondary border-brand-secondary/30",
  },
  average: {
    label: "Cukup",
    className: "bg-brand-accent/20 text-brand-accent border-brand-accent/30",
  },
  needs_improvement: {
    label: "Perlu Perbaikan",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
  },
};

function getScoreColor(score: number) {
  if (score >= 70) return "text-brand-secondary";
  if (score >= 40) return "text-brand-accent";
  return "text-red-400";
}

export function FeedbackSummary({ feedback }: Readonly<FeedbackSummaryProps>) {
  return (
    <div className="space-y-5">
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-2xl p-6 text-center"
      >
        <div className="text-brand-text-muted text-sm mb-1">Skor Keseluruhan</div>
        <div className={`text-5xl font-bold ${getScoreColor(feedback.overall_score)}`}>
          {Math.round(feedback.overall_score)}
        </div>
        <div className="text-brand-text-muted text-sm">dari 100</div>
      </motion.div>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-2xl p-5">
          <h3 className="text-brand-secondary font-semibold text-sm mb-3">
            Kekuatan
          </h3>
          <ul className="space-y-2">
            {feedback.strengths.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-brand-text/80 text-sm"
              >
                <span className="text-brand-secondary mt-0.5">&#10003;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <div className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-2xl p-5">
          <h3 className="text-brand-accent font-semibold text-sm mb-3">
            Area Perbaikan
          </h3>
          <ul className="space-y-2">
            {feedback.improvements.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-brand-text/80 text-sm"
              >
                <span className="text-brand-accent mt-0.5">!</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Question Summaries */}
      <div>
        <h3 className="text-brand-text font-semibold text-sm mb-3">
          Detail per Pertanyaan
        </h3>
        <div className="space-y-3">
          {feedback.question_summaries.map((q, i) => {
            const quality = QUALITY_LABELS[q.answer_quality] || QUALITY_LABELS.average;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-brand-text/90 text-sm font-medium flex-1">
                    {q.question}
                  </p>
                  <Badge className={quality.className}>{quality.label}</Badge>
                </div>
                <p className="text-brand-text-muted text-xs">{q.tip}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
