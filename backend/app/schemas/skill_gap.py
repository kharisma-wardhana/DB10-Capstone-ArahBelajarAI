"""Request/response schemas for skill gap analysis."""

from pydantic import BaseModel, Field


class SkillGapRequest(BaseModel):
    user_skills: str = Field(
        ...,
        min_length=3,
        description="Comma-separated user skills",
    )
    job_title: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Target job title",
    )


class MatchedSkillResponse(BaseModel):
    user_skill: str
    required_skill: str
    category: str
    similarity: float
    frequency: float


class MissingSkillResponse(BaseModel):
    skill_name: str
    category: str
    frequency: float
    importance_rank: int


class CategoryScoreResponse(BaseModel):
    category: str
    total_required: int
    user_has: int
    coverage_pct: float
    missing: list[str]


class SkillGapResponse(BaseModel):
    job_title_matched: str
    job_title_confidence: float
    matched_skills: list[MatchedSkillResponse]
    missing_skills: list[MissingSkillResponse]
    category_breakdown: dict[str, CategoryScoreResponse]
    overall_readiness_score: float


class JobTitleListResponse(BaseModel):
    job_titles: list[str]
    total: int
