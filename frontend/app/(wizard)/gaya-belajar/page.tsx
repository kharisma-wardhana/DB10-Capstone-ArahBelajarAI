"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/shared/store/wizard-store";
import type { LearningStyle } from "@/shared/store/wizard-store";
import { VAK_QUESTIONS } from "@/features/vak-quiz/data/vak-questions";
import { calculateVakResult } from "@/features/vak-quiz/lib/vak-scoring";
import { VakQuestionCard } from "@/features/vak-quiz/components/vak-question-card";
import { VakResultCard } from "@/features/vak-quiz/components/vak-result-card";

export default function GayaBelajarPage() {
  const router = useRouter();
  const { vakResult, setVakResult, completeStep } = useWizardStore();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, LearningStyle>>({});
  const [showResult, setShowResult] = useState(!!vakResult);

  const totalQuestions = VAK_QUESTIONS.length;
  const isLastQuestion = currentQ === totalQuestions - 1;
  const allAnswered = Object.keys(answers).length === totalQuestions;

  function handleAnswer(style: LearningStyle) {
    setAnswers((prev) => ({ ...prev, [currentQ]: style }));
  }

  function handleNext() {
    if (isLastQuestion && allAnswered) {
      const result = calculateVakResult(answers);
      setVakResult(result);
      setShowResult(true);
    } else if (answers[currentQ]) {
      setCurrentQ((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentQ > 0) setCurrentQ((prev) => prev - 1);
  }

  function handleContinue() {
    completeStep(1);
    router.push("/pekerjaan-impian");
  }

  function handleRetake() {
    setAnswers({});
    setCurrentQ(0);
    setShowResult(false);
  }

  // Show result view
  if (showResult && (vakResult || allAnswered)) {
    const result = vakResult || calculateVakResult(answers);
    return (
      <div className="space-y-6">
        <VakResultCard result={result} />
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRetake}
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer"
          >
            Ulangi Quiz
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1 bg-white text-indigo-700 hover:bg-white/90 font-semibold cursor-pointer"
          >
            Lanjut
          </Button>
        </div>
      </div>
    );
  }

  // Show quiz
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold mb-1">
          Quiz Gaya Belajar
        </h2>
        <p className="text-white/60 text-sm">
          Jawab 6 pertanyaan untuk mengetahui gaya belajar terbaikmu
        </p>
      </div>

      <VakQuestionCard
        question={VAK_QUESTIONS[currentQ]}
        selectedAnswer={answers[currentQ]}
        onAnswer={handleAnswer}
        questionIndex={currentQ}
        totalQuestions={totalQuestions}
      />

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentQ === 0}
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-30 cursor-pointer"
        >
          Kembali
        </Button>
        <Button
          onClick={handleNext}
          disabled={!answers[currentQ]}
          className="flex-1 bg-white text-indigo-700 hover:bg-white/90 font-semibold disabled:opacity-30 cursor-pointer"
        >
          {isLastQuestion && allAnswered ? "Lihat Hasil" : "Selanjutnya"}
        </Button>
      </div>
    </div>
  );
}
