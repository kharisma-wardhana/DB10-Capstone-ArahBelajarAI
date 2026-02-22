"""Request/response schemas for mock interview and AI career mentor."""

from typing import Optional

from pydantic import BaseModel, Field


class InterviewStartRequest(BaseModel):
    job_role: str = Field(..., min_length=2, max_length=200)
    user_skills: list[str] = Field(
        default_factory=list,
        description="Optional: user's skill list for context",
    )
    language: str = Field("id", description="'id' for Bahasa Indonesia, 'en' for English")
    mode: str = Field(
        "interview",
        description="Session mode: 'interview', 'career_advice', or 'learning_coach'",
    )
    wizard_context: Optional[dict] = Field(
        None,
        description="Full wizard state for context-aware mentoring (vak_result, gap_result, etc.)",
    )


class InterviewStartResponse(BaseModel):
    session_id: str
    job_role: str
    first_question: str
    mode: str = "interview"


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)


class ChatMessageResponse(BaseModel):
    role: str = "assistant"
    content: str
    question_number: int
    total_questions: int = 5
    is_complete: bool = False


class InterviewFeedbackResponse(BaseModel):
    session_id: str
    job_role: str
    overall_score: float
    strengths: list[str]
    improvements: list[str]
    question_summaries: list[dict]
