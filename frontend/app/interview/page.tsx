"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/shared/store/wizard-store";
import { apiRequest } from "@/shared/api/client";
import { API } from "@/shared/api/endpoints";
import type {
  InterviewStartResponse,
  MentorMode,
  SSEDoneEvent,
} from "@/shared/api/types";
import { streamInterviewChat } from "@/features/interview/lib/sse-client";
import { ChatMessage } from "@/features/interview/components/chat-message";
import { ChatInput } from "@/features/interview/components/chat-input";
import { MentorModeSelector } from "@/features/interview/components/mentor-mode-selector";
import { AnimatedSkeleton } from "@/shared/components/ui/animated-skeleton";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const MODE_LABELS: Record<MentorMode, string> = {
  interview: "Mock Interview",
  career_advice: "Konsultasi Karir",
  learning_coach: "Rencana Belajar",
};

export default function InterviewPage() {
  const router = useRouter();
  const {
    selectedJobTitle,
    extractedSkills,
    gapResult,
    interview,
    setInterview,
    appendMessage,
    updateLastAssistantMessage,
    resetInterview,
    getWizardContext,
  } = useWizardStore();

  const [initializing, setInitializing] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show mode selector if no active session
  const showModeSelector = !interview.sessionId && !initializing;

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interview.messages]);

  async function handleModeSelect(mode: MentorMode) {
    setInitializing(true);
    setError(null);

    const jobRole = selectedJobTitle || "Software Engineer";
    const userSkills = extractedSkills.map((s) => s.skill_name);

    // Build wizard context for career_advice and learning_coach modes
    const wizardContext = mode === "interview" ? null : getWizardContext();

    try {
      const data = await apiRequest<InterviewStartResponse>(
        API.INTERVIEW_START,
        {
          method: "POST",
          body: JSON.stringify({
            job_role: jobRole,
            user_skills: userSkills,
            language: "id",
            mode,
            wizard_context: wizardContext,
          }),
        },
      );

      setInterview({
        sessionId: data.session_id,
        jobRole: data.job_role,
        messages: [{ role: "assistant", content: data.first_question }],
        questionNumber: mode === "interview" ? 1 : 0,
        isComplete: false,
        mode: data.mode,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memulai sesi");
    } finally {
      setInitializing(false);
    }
  }

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

  function handleSwitchMode() {
    resetInterview();
  }

  // Mode selector screen
  if (showModeSelector) {
    return (
      <div className="min-h-screen bg-linear-to-br from-brand-gradient-start to-brand-gradient-end flex flex-col">
        <div className="sticky top-0 z-10 pt-safe backdrop-blur-xl bg-brand-card border-b border-brand-card-border px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/hasil-analisis")}
              className="text-brand-text-muted hover:text-brand-text cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
            <ThemeToggle />
          </div>
        </div>
        <div className="flex-1">
          <MentorModeSelector
            onSelect={handleModeSelect}
            hasGapResult={!!gapResult}
          />
          {error && (
            <div className="px-4">
              <div className="max-w-md mx-auto bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (initializing) {
    return (
      <div className="min-h-screen bg-linear-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <AnimatedSkeleton blocks={["h-12", "h-24", "h-8"]} />
        </div>
      </div>
    );
  }

  const isInterviewMode = interview.mode === "interview";

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-gradient-start to-brand-gradient-end flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 pt-safe backdrop-blur-xl bg-brand-card border-b border-brand-card-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between pt-4">
          <div>
            <h2 className="text-brand-text font-semibold text-sm">
              {MODE_LABELS[interview.mode] || "MentorAI"}
            </h2>
            <p className="text-brand-text-muted text-xs">{interview.jobRole}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Question progress dots (interview mode only) */}
            {isInterviewMode && (
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
            )}
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchMode}
              className="bg-brand-card border-brand-card-border text-brand-text hover:bg-brand-card-hover text-xs cursor-pointer"
            >
              Ganti Mode
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {interview.messages.map((msg, i) => (
            <ChatMessage
              key={`message-${msg.role}-${i}`}
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
        {interview.isComplete && isInterviewMode ? (
          <motion.div
            className="p-4 text-center space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-brand-text/80 text-sm">
              Interview selesai! Lihat feedback dan evaluasi kamu.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => router.push("/interview/feedback")}
                className="bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover font-semibold cursor-pointer"
              >
                Lihat Feedback
              </Button>
              <Button
                variant="outline"
                onClick={handleSwitchMode}
                className="bg-brand-card border-brand-card-border text-brand-text hover:bg-brand-card-hover cursor-pointer"
              >
                Mode Lain
              </Button>
            </div>
          </motion.div>
        ) : (
          <ChatInput
            onSend={handleSend}
            disabled={streaming || !interview.sessionId}
            questionNumber={interview.questionNumber}
            totalQuestions={isInterviewMode ? 5 : 0}
          />
        )}
      </div>
    </div>
  );
}
