"use client";

import { Bot } from "lucide-react";
import { motion } from "framer-motion";
import { TypingIndicator } from "@/shared/components/ui/animated-skeleton";
import type { ChatMessage as ChatMessageType } from "@/shared/store/wizard-store";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: Readonly<ChatMessageProps>) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-brand-primary/20 flex items-center justify-center mr-2 mt-1 shrink-0">
          <Bot className="w-4 h-4 text-brand-primary-light" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-brand-primary text-white rounded-br-md"
            : "backdrop-blur-xl bg-brand-card border border-brand-card-border text-brand-text/90 rounded-bl-md"
        }`}
      >
        {message.content || (
          isStreaming ? <TypingIndicator /> : (
            <span className="inline-block w-2 h-4 bg-brand-text-muted animate-pulse rounded-sm" />
          )
        )}
      </div>
    </motion.div>
  );
}
