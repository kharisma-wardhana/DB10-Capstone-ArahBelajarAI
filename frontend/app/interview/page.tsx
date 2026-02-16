"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/shared/store/wizard-store";
import { apiRequest } from "@/shared/api/client";
import { API } from "@/shared/api/endpoints";
import type { InterviewStartResponse, SSEDoneEvent } from "@/shared/api/types";
import { streamInterviewChat } from "@/features/interview/lib/sse-client";
import { ChatMessage } from "@/features/interview/components/chat-message";
import { ChatInput } from "@/features/interview/components/chat-input";
import { AnimatedSkeleton } from "@/shared/components/ui/animated-skeleton";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { motion } from "framer-motion";

export default function InterviewPage() {
  const router = useRouter();
  const {
    selectedJobTitle,
    extractedSkills,
    interview,
    setInterview,
    appendMessage,
    updateLastAssistantMessage,
  } = useWizardStore();

  const [initializing, setInitializing] = useState(!interview.sessionId);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interview.messages]);

  // Start interview session
  useEffect(() => {
    if (interview.sessionId) {
      setInitializing(false);
      return;
    }

    const jobRole = selectedJobTitle || "Software Engineer";
    const userSkills = extractedSkills.map((s) => s.skill_name);

    apiRequest<InterviewStartResponse>(API.INTERVIEW_START, {
      method: "POST",
      body: JSON.stringify({
        job_role: jobRole,
        user_skills: userSkills,
        language: "id",
      }),
    })
      .then((data) => {
        setInterview({
          sessionId: data.session_id,
          jobRole: data.job_role,
          messages: [{ role: "assistant", content: data.first_question }],
          questionNumber: 1,
          isComplete: false,
        });
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Gagal memulai sesi interview",
        );
      })
      .finally(() => setInitializing(false));
  }, [interview.sessionId, selectedJobTitle, extractedSkills, setInterview]);

  async function handleSend(message: string) {
    if (!interview.sessionId || streaming) return;

    appendMessage({ role: "user", content: message });
    appendMessage({ role: "assistant", content: "" });

    setStreaming(true);
    setError(null);

    await streamInterviewChat(
      interview.sessionId,
      message,
      (token) => {
        updateLastAssistantMessage(token);
      },
      (meta: SSEDoneEvent) => {
        setInterview({
          questionNumber: meta.question_number,
          isComplete: meta.is_complete,
        });
        setStreaming(false);
      },
      (err) => {
        setError(err.message);
        setStreaming(false);
      },
    );
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-linear-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <AnimatedSkeleton blocks={["h-12", "h-24", "h-8"]} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-gradient-start to-brand-gradient-end flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 pt-safe backdrop-blur-xl bg-brand-card border-b border-brand-card-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between pt-4">
          <div>
            <h2 className="text-brand-text font-semibold text-sm">
              Mock Interview
            </h2>
            <p className="text-brand-text-muted text-xs">{interview.jobRole}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Question progress dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < interview.questionNumber
                      ? "bg-brand-secondary"
                      : "bg-brand-card-border"
                  }`}
                />
              ))}
              <span className="text-brand-text-muted text-xs ml-1">
                {interview.questionNumber}/5
              </span>
            </div>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/hasil-analisis")}
              className="bg-brand-card border-brand-card-border text-brand-text hover:bg-brand-card-hover text-xs cursor-pointer"
            >
              Kembali
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {interview.messages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              isStreaming={
                streaming &&
                i === interview.messages.length - 1 &&
                msg.role === "assistant"
              }
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4">
          <div className="max-w-2xl mx-auto bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm mb-2">
            {error}
          </div>
        </div>
      )}

      {/* Input or Completion */}
      <div className="max-w-2xl mx-auto w-full pb-safe">
        {interview.isComplete ? (
          <motion.div
            className="p-4 text-center space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-brand-text/80 text-sm">
              Interview selesai! Lihat feedback dan evaluasi kamu.
            </p>
            <Button
              onClick={() => router.push("/interview/feedback")}
              className="bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover font-semibold cursor-pointer"
            >
              Lihat Feedback
            </Button>
          </motion.div>
        ) : (
          <ChatInput
            onSend={handleSend}
            disabled={streaming || !interview.sessionId}
            questionNumber={interview.questionNumber}
            totalQuestions={5}
          />
        )}
      </div>
    </div>
  );
}
