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
import { PageTransition } from "@/shared/components/layout/page-transition";
import { motion } from "framer-motion";

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
      <PageTransition>
        <div className="space-y-6 p-4 md:p-8 pb-safe">
          <VakResultCard result={result} />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRetake}
              className="flex-1 bg-brand-card border-brand-card-border text-brand-text hover:bg-brand-card-hover cursor-pointer"
            >
              Ulangi Quiz
            </Button>
            <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleContinue}
                className="w-full bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover font-semibold cursor-pointer"
              >
                Lanjut
              </Button>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Show quiz
  return (
    <PageTransition>
      <div className="space-y-6 p-4 md:p-8 pb-safe">
        <div>
          <h2 className="text-brand-text text-2xl font-bold mb-1">
            Quiz Gaya Belajar
          </h2>
          <p className="text-brand-text-muted text-sm">
            Jawab 6 pertanyaan untuk mengetahui gaya belajar terbaikmu
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-brand-card-border overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-brand-primary-light"
              animate={{
                width: `${((currentQ + (answers[currentQ] ? 1 : 0)) / totalQuestions) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-brand-text-muted text-xs">
            {currentQ + 1}/{totalQuestions}
          </span>
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
            className="flex-1 bg-brand-card border-brand-card-border text-brand-text hover:bg-brand-card-hover disabled:opacity-30 cursor-pointer"
          >
            Kembali
          </Button>
          <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleNext}
              disabled={!answers[currentQ]}
              className="w-full bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover font-semibold disabled:opacity-30 cursor-pointer"
            >
              {isLastQuestion && allAnswered ? "Lihat Hasil" : "Selanjutnya"}
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
