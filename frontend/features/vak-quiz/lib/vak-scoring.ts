import type { LearningStyle, VakResult } from "@/shared/store/wizard-store";

export function calculateVakResult(
  answers: Record<number, LearningStyle>,
): VakResult {
  const scores = { visual: 0, auditory: 0, kinesthetic: 0 };

  Object.values(answers).forEach((style) => {
    scores[style]++;
  });

  // Determine dominant style (tie-break: kinesthetic > visual > auditory)
  let dominant: LearningStyle = "kinesthetic";
  if (
    scores.visual > scores.kinesthetic &&
    scores.visual > scores.auditory
  ) {
    dominant = "visual";
  } else if (
    scores.auditory > scores.kinesthetic &&
    scores.auditory > scores.visual
  ) {
    dominant = "auditory";
  } else if (scores.kinesthetic >= scores.visual && scores.kinesthetic >= scores.auditory) {
    dominant = "kinesthetic";
  } else if (scores.visual >= scores.auditory) {
    dominant = "visual";
  } else {
    dominant = "auditory";
  }

  return { dominant, scores };
}
