"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/shared/store/wizard-store";
import { apiRequest } from "@/shared/api/client";
import { API } from "@/shared/api/endpoints";
import type { InterviewFeedbackResponse } from "@/shared/api/types";
import { FeedbackSummary } from "@/features/interview/components/feedback-summary";
import { AnimatedSkeleton } from "@/shared/components/ui/animated-skeleton";
import { PageTransition } from "@/shared/components/layout/page-transition";
import { motion } from "framer-motion";

export default function InterviewFeedbackPage() {
  const router = useRouter();
  const { interview, resetAll } = useWizardStore();
  const [feedback, setFeedback] = useState<InterviewFeedbackResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interview.sessionId) {
      router.push("/interview");
      return;
    }

    apiRequest<InterviewFeedbackResponse>(
      API.INTERVIEW_FEEDBACK(interview.sessionId),
    )
      .then(setFeedback)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Gagal memuat feedback",
        );
      })
      .finally(() => setLoading(false));
  }, [interview.sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-brand-gradient-start to-brand-gradient-end p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <AnimatedSkeleton blocks={["h-32", "h-24", "h-24"]} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-gradient-start to-brand-gradient-end p-4 pb-safe">
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <PageTransition>
          <div>
            <h2 className="text-brand-text text-2xl font-bold mb-1">
              Feedback Interview
            </h2>
            <p className="text-brand-text-muted text-sm">
              Evaluasi mock interview untuk posisi{" "}
              <span className="text-brand-text font-medium">
                {interview.jobRole}
              </span>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm mt-6">
              {error}
            </div>
          )}

          {feedback && (
            <div className="mt-6">
              <FeedbackSummary feedback={feedback} />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/hasil-analisis")}
              className="flex-1 bg-brand-card border-brand-card-border text-brand-text hover:bg-brand-card-hover cursor-pointer"
            >
              Kembali ke Analisis
            </Button>
            <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => {
                  resetAll();
                  router.push("/");
                }}
                className="w-full bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover font-semibold cursor-pointer"
              >
                Mulai Ulang
              </Button>
            </motion.div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
