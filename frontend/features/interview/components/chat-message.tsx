"use client";

import type { ChatMessage as ChatMessageType } from "@/shared/store/wizard-store";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-500 text-white rounded-br-md"
            : "backdrop-blur-xl bg-white/10 border border-white/20 text-white/90 rounded-bl-md"
        }`}
      >
        {message.content || (
          <span className="inline-block w-2 h-4 bg-white/40 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  );
}
