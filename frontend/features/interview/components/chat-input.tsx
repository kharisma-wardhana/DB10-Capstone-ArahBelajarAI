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
}: ChatInputProps) {
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
    <div className="border-t border-white/10 bg-white/5 p-3">
      <div className="text-white/40 text-xs mb-2 text-center">
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
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-white/40 disabled:opacity-40"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          size="icon"
          className="bg-indigo-500 hover:bg-indigo-600 text-white self-end disabled:opacity-30 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
