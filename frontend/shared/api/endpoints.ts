export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API = {
  SKILLS_EXTRACT: "/api/v1/skills/extract",
  SKILLS_GAP_ANALYSIS: "/api/v1/skills/gap-analysis",
  JOBS_TITLES: "/api/v1/jobs/titles",
  INTERVIEW_START: "/api/v1/interview/start",
  INTERVIEW_CHAT: (sessionId: string) =>
    `/api/v1/interview/${sessionId}/chat`,
  INTERVIEW_FEEDBACK: (sessionId: string) =>
    `/api/v1/interview/${sessionId}/feedback`,
  ROADMAP_GENERATE: "/api/v1/roadmap/generate",
} as const;
