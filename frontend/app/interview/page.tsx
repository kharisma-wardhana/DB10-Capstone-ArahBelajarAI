"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWizardStore } from "@/shared/store/wizard-store";
import { apiRequest } from "@/shared/api/client";
import { API } from "@/shared/api/endpoints";
import type { InterviewStartResponse, SSEDoneEvent } from "@/shared/api/types";
import { streamInterviewChat } from "@/features/interview/lib/sse-client";
import { ChatMessage } from "@/features/interview/components/chat-message";
import { ChatInput } from "@/features/interview/components/chat-input";

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
          err instanceof Error
            ? err.message
            : "Gagal memulai sesi interview",
        );
      })
      .finally(() => setInitializing(false));
  }, [interview.sessionId, selectedJobTitle, extractedSkills, setInterview]);

  async function handleSend(message: string) {
    if (!interview.sessionId || streaming) return;

    // Add user message
    appendMessage({ role: "user", content: message });
    // Add empty assistant message for streaming
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
      <div className="min-h-screen bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-4">
          <Skeleton className="h-12 w-3/4 bg-white/10 rounded-xl" />
          <Skeleton className="h-24 w-full bg-white/10 rounded-xl" />
          <Skeleton className="h-8 w-1/2 bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/10 border-b border-white/20 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-sm">
              Mock Interview
            </h2>
            <p className="text-white/50 text-xs">{interview.jobRole}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/hasil-analisis")}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs cursor-pointer"
          >
            Kembali
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {interview.messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
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
      <div className="max-w-2xl mx-auto w-full">
        {interview.isComplete ? (
          <div className="p-4 text-center space-y-3">
            <p className="text-white/80 text-sm">
              Interview selesai! Lihat feedback dan evaluasi kamu.
            </p>
            <Button
              onClick={() => router.push("/interview/feedback")}
              className="bg-white text-indigo-700 hover:bg-white/90 font-semibold cursor-pointer"
            >
              Lihat Feedback
            </Button>
          </div>
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
