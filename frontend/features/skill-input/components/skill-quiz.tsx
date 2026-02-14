"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { SKILL_QUIZ_QUESTIONS } from "../data/skill-quiz-questions";
import { collectSkillsFromAnswers } from "../lib/skill-quiz-scoring";

interface SkillQuizProps {
  onComplete: (skills: string[]) => void;
}

export function SkillQuiz({ onComplete }: Readonly<SkillQuizProps>) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});

  const question = SKILL_QUIZ_QUESTIONS[currentQ];
  const isLast = currentQ === SKILL_QUIZ_QUESTIONS.length - 1;
  const selected = answers[question.id] || [];

  function toggleOption(index: number) {
    const current = answers[question.id] || [];

    if (question.multiSelect) {
      const updated = current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index];
      setAnswers({ ...answers, [question.id]: updated });
    } else {
      setAnswers({ ...answers, [question.id]: [index] });
    }
  }

  function handleNext() {
    if (isLast) {
      const skills = collectSkillsFromAnswers(answers, SKILL_QUIZ_QUESTIONS);
      onComplete(skills);
    } else {
      setCurrentQ((prev) => prev + 1);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-brand-text-muted text-sm">
        Pertanyaan {currentQ + 1} dari {SKILL_QUIZ_QUESTIONS.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-brand-text text-lg font-semibold">{question.question}</h3>

          {question.multiSelect && (
            <p className="text-brand-text-muted text-xs mt-1">Bisa pilih lebih dari satu</p>
          )}

          <div className="space-y-2 mt-4">
            {question.options.map((option, i) => (
              <button
                key={option.text}
                onClick={() => toggleOption(i)}
                className={`w-full text-left p-3 min-h-12 rounded-xl border transition-all cursor-pointer ${
                  selected.includes(i)
                    ? "bg-brand-card-hover border-brand-primary-light/40"
                    : "bg-brand-card/50 border-brand-card-border hover:bg-brand-card-hover"
                }`}
              >
                <span className="text-brand-text/90 text-sm">{option.text}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
          disabled={currentQ === 0}
          className="flex-1 bg-brand-card border-brand-card-border text-brand-text hover:bg-brand-card-hover disabled:opacity-30 cursor-pointer"
        >
          Kembali
        </Button>
        <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
          <Button
            onClick={handleNext}
            disabled={selected.length === 0}
            className="w-full bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover font-semibold disabled:opacity-30 cursor-pointer"
          >
            {isLast ? "Selesai" : "Selanjutnya"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
