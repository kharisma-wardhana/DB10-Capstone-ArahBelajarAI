"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
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
}: Readonly<VakQuestionCardProps>) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
        className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-2xl p-6 shadow-lg"
      >
        <div className="text-brand-text-muted text-sm mb-2">
          Pertanyaan {questionIndex + 1} dari {totalQuestions}
        </div>
        <h3 className="text-brand-text text-lg font-semibold mb-5">
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
              className={`flex items-center gap-3 p-4 min-h-12 rounded-xl border cursor-pointer transition-all ${
                selectedAnswer === option.style
                  ? "bg-brand-card-hover border-brand-primary-light/40"
                  : "bg-brand-card/50 border-brand-card-border hover:bg-brand-card-hover"
              }`}
            >
              <RadioGroupItem
                value={option.style}
                className="border-brand-card-border text-brand-text"
              />
              <span className="text-brand-text/90 text-sm">{option.text}</span>
            </label>
          ))}
        </RadioGroup>
      </motion.div>
    </AnimatePresence>
  );
}
