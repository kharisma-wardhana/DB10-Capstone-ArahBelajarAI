"""Request/response schemas for skill extraction."""

from enum import Enum

from pydantic import BaseModel, Field


class InputMode(str, Enum):
    SKILL_LIST = "skill_list"
    FREE_TEXT = "free_text"


class SkillExtractionRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=3,
        max_length=10_000,
        description="Comma-separated skills or free-text CV/resume",
    )
    mode: InputMode = Field(
        InputMode.SKILL_LIST,
        description="Input mode: 'skill_list' or 'free_text'",
    )


class ExtractedSkillResponse(BaseModel):
    skill_name: str
    skill_id: int
    category: str
    confidence: float
    matched_from: str


class SkillExtractionResponse(BaseModel):
    skills: list[ExtractedSkillResponse]
    total_found: int
    input_mode: str
