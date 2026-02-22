// Generic API response wrapper (mirrors backend APIResponse[T])
export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// --- Skill Extraction ---
export type InputMode = "skill_list" | "free_text";

export interface SkillExtractionRequest {
  text: string;
  mode: InputMode;
}

export interface ExtractedSkill {
  skill_name: string;
  skill_id: number;
  category: string;
  confidence: number;
  matched_from: string;
}

export interface SkillExtractionResponse {
  skills: ExtractedSkill[];
  total_found: number;
  input_mode: string;
}

// --- Skill Gap Analysis ---
export interface SkillGapRequest {
  user_skills: string;
  job_title: string;
}

export interface SkillDemandTrend {
  predicted_trend: "stable" | "hot" | "declining";
  confidence: number;
  growth_rate: number;
  current_demand: number;
}

export interface MatchedSkill {
  user_skill: string;
  required_skill: string;
  category: string;
  similarity: number;
  frequency: number;
  demand_trend?: SkillDemandTrend | null;
}

export interface MissingSkill {
  skill_name: string;
  category: string;
  frequency: number;
  importance_rank: number;
  demand_trend?: SkillDemandTrend | null;
  priority_score?: number | null;
}

export interface CategoryScore {
  category: string;
  total_required: number;
  user_has: number;
  coverage_pct: number;
  missing: string[];
}

export interface SkillGapResponse {
  job_title_matched: string;
  job_title_confidence: number;
  matched_skills: MatchedSkill[];
  missing_skills: MissingSkill[];
  category_breakdown: Record<string, CategoryScore>;
  overall_readiness_score: number;
}

// --- Job Titles ---
export interface JobTitleListResponse {
  job_titles: string[];
  total: number;
}

// --- Interview / MentorAI ---
export type MentorMode = "interview" | "career_advice" | "learning_coach";

export interface InterviewStartRequest {
  job_role: string;
  user_skills?: string[];
  language?: "id" | "en";
  mode?: MentorMode;
  wizard_context?: Record<string, unknown> | null;
}

export interface InterviewStartResponse {
  session_id: string;
  job_role: string;
  first_question: string;
  mode: MentorMode;
}

export interface ChatMessageRequest {
  message: string;
}

export interface InterviewFeedbackResponse {
  session_id: string;
  job_role: string;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  question_summaries: {
    question: string;
    answer_quality: "good" | "average" | "needs_improvement";
    tip: string;
  }[];
}

// --- Learning Roadmap ---
export interface CourseRecommendation {
  title: string;
  platform: "Coursera" | "Udemy";
  url: string;
  category: string;
  level: string;
  match_score: number;
  subscribers: number;
  reviews: number;
  content_hours: number;
}

export interface RoadmapSkillItem {
  skill_name: string;
  category: string;
  frequency: number;
  priority_score: number;
  courses: CourseRecommendation[];
}

export interface RoadmapPhase {
  phase: number;
  name: string;
  description: string;
  weeks: string;
  skills: RoadmapSkillItem[];
}

export interface RoadmapResponse {
  phases: RoadmapPhase[];
  total_skills: number;
  total_courses: number;
  vak_style?: string | null;
}

// --- SSE Events ---
export interface SSETokenEvent {
  token: string;
}

export interface SSEDoneEvent {
  done: true;
  question_number: number;
  total_questions: number;
  is_complete: boolean;
  mode?: MentorMode;
}

export type SSEEvent = SSETokenEvent | SSEDoneEvent;
