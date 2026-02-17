"""Request/response schemas for learning roadmap."""

from typing import Optional

from pydantic import BaseModel, Field


class RoadmapRequest(BaseModel):
    missing_skills: list[dict] = Field(
        ...,
        min_length=1,
        description="List of missing skill objects from gap analysis",
    )
    vak_style: Optional[str] = Field(
        None,
        description="VAK learning style: visual, auditory, or kinesthetic",
    )
    job_title: Optional[str] = Field(
        None,
        description="Target job title for context",
    )


class CourseRecommendation(BaseModel):
    title: str
    platform: str
    url: str
    category: str
    level: str
    match_score: float
    subscribers: int = 0
    reviews: int = 0
    content_hours: float = 0


class RoadmapSkillItem(BaseModel):
    skill_name: str
    category: str
    frequency: float
    priority_score: float
    courses: list[CourseRecommendation]


class RoadmapPhase(BaseModel):
    phase: int
    name: str
    description: str
    weeks: str
    skills: list[RoadmapSkillItem]


class RoadmapResponse(BaseModel):
    phases: list[RoadmapPhase]
    total_skills: int
    total_courses: int
    vak_style: Optional[str] = None
