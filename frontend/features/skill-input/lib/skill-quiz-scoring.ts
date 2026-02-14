export function collectSkillsFromAnswers(
  answers: Record<number, number[]>,
  questions: {
    id: number;
    options: { skills: string[] }[];
  }[],
): string[] {
  const skills = new Set<string>();

  for (const question of questions) {
    const selectedIndices = answers[question.id] || [];
    for (const idx of selectedIndices) {
      const option = question.options[idx];
      if (option) {
        option.skills.forEach((s) => skills.add(s));
      }
    }
  }

  return Array.from(skills);
}
