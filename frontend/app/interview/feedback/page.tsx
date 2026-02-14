"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWizardStore } from "@/shared/store/wizard-store";
import { apiRequest } from "@/shared/api/client";
import { API } from "@/shared/api/endpoints";
import type { InterviewFeedbackResponse } from "@/shared/api/types";
import { FeedbackSummary } from "@/features/interview/components/feedback-summary";

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
      <div className="min-h-screen bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
        <div className="max-w-2xl mx-auto space-y-4 pt-8">
          <Skeleton className="h-32 w-full bg-white/10 rounded-2xl" />
          <Skeleton className="h-24 w-full bg-white/10 rounded-2xl" />
          <Skeleton className="h-24 w-full bg-white/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold mb-1">
            Feedback Interview
          </h2>
          <p className="text-white/60 text-sm">
            Evaluasi mock interview untuk posisi{" "}
            <span className="text-white font-medium">
              {interview.jobRole}
            </span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {feedback && <FeedbackSummary feedback={feedback} />}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/hasil-analisis")}
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer"
          >
            Kembali ke Analisis
          </Button>
          <Button
            onClick={() => {
              resetAll();
              router.push("/");
            }}
            className="flex-1 bg-white text-indigo-700 hover:bg-white/90 font-semibold cursor-pointer"
          >
            Mulai Ulang
          </Button>
        </div>
      </div>
    </div>
  );
}
