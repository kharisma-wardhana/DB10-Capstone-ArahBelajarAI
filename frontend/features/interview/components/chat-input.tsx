"use client";

import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export function ChatInput({
  onSend,
  disabled,
  questionNumber,
  totalQuestions,
}: Readonly<ChatInputProps>) {
  const [input, setInput] = useState("");

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-brand-card-border bg-brand-card/50 p-3">
      <div className="text-brand-text-muted text-xs mb-2 text-center">
        Pertanyaan {Math.min(questionNumber + 1, totalQuestions)} dari{" "}
        {totalQuestions}
      </div>
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled ? "Menunggu respons..." : "Ketik jawaban kamu..."
          }
          disabled={disabled}
          rows={2}
          className="flex-1 bg-brand-card border border-brand-card-border rounded-xl px-3 py-2 text-brand-text text-sm placeholder:text-brand-text-muted resize-none focus:outline-none focus:border-brand-primary-light/40 disabled:opacity-40"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          size="icon"
          className="bg-brand-primary hover:bg-brand-primary-light text-white self-end disabled:opacity-30 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
