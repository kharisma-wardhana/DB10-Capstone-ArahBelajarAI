"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { VakQuestion } from "../data/vak-questions";
import type { LearningStyle } from "@/shared/store/wizard-store";

interface VakQuestionCardProps {
  question: VakQuestion;
  selectedAnswer: LearningStyle | undefined;
  onAnswer: (style: LearningStyle) => void;
  questionIndex: number;
  totalQuestions: number;
}

export function VakQuestionCard({
  question,
  selectedAnswer,
  onAnswer,
  questionIndex,
  totalQuestions,
}: VakQuestionCardProps) {
  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
      <div className="text-white/50 text-sm mb-2">
        Pertanyaan {questionIndex + 1} dari {totalQuestions}
      </div>
      <h3 className="text-white text-lg font-semibold mb-5">
        {question.question}
      </h3>
      <RadioGroup
        value={selectedAnswer}
        onValueChange={(val) => onAnswer(val as LearningStyle)}
        className="space-y-3"
      >
        {question.options.map((option) => (
          <label
            key={option.style}
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              selectedAnswer === option.style
                ? "bg-white/20 border-white/40"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <RadioGroupItem
              value={option.style}
              className="border-white/40 text-white"
            />
            <span className="text-white/90 text-sm">{option.text}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
