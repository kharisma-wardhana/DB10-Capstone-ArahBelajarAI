"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SKILL_QUIZ_QUESTIONS } from "../data/skill-quiz-questions";
import { collectSkillsFromAnswers } from "../lib/skill-quiz-scoring";

interface SkillQuizProps {
  onComplete: (skills: string[]) => void;
}

export function SkillQuiz({ onComplete }: SkillQuizProps) {
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
      <div className="text-white/50 text-sm">
        Pertanyaan {currentQ + 1} dari {SKILL_QUIZ_QUESTIONS.length}
      </div>

      <h3 className="text-white text-lg font-semibold">{question.question}</h3>

      {question.multiSelect && (
        <p className="text-white/40 text-xs">Bisa pilih lebih dari satu</p>
      )}

      <div className="space-y-2">
        {question.options.map((option, i) => (
          <button
            key={option.text}
            onClick={() => toggleOption(i)}
            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
              selected.includes(i)
                ? "bg-white/20 border-white/40"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <span className="text-white/90 text-sm">{option.text}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
          disabled={currentQ === 0}
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-30 cursor-pointer"
        >
          Kembali
        </Button>
        <Button
          onClick={handleNext}
          disabled={selected.length === 0}
          className="flex-1 bg-white text-indigo-700 hover:bg-white/90 font-semibold disabled:opacity-30 cursor-pointer"
        >
          {isLast ? "Selesai" : "Selanjutnya"}
        </Button>
      </div>
    </div>
  );
}
