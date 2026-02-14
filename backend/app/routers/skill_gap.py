"""Skill gap analysis endpoints."""

from fastapi import APIRouter, Depends

from app.dependencies import get_skill_gap_service
from app.schemas.common import APIResponse
from app.schemas.skill_gap import (
    CategoryScoreResponse,
    JobTitleListResponse,
    MatchedSkillResponse,
    MissingSkillResponse,
    SkillGapRequest,
    SkillGapResponse,
)
from app.services.skill_gap_service import SkillGapService
from ml.src.skill_normalizer import parse_skills_csv

router = APIRouter()


@router.post("/skills/gap-analysis", response_model=APIResponse[SkillGapResponse])
async def analyze_skill_gap(
    request: SkillGapRequest,
    service: SkillGapService = Depends(get_skill_gap_service),
):
    user_skill_names = parse_skills_csv(request.user_skills)
    result = service.analyze_gap(user_skill_names, request.job_title)

    response = SkillGapResponse(
        job_title_matched=result.job_title_matched,
        job_title_confidence=result.job_title_confidence,
        matched_skills=[
            MatchedSkillResponse(**m.to_dict()) for m in result.matched_skills
        ],
        missing_skills=[
            MissingSkillResponse(**m.to_dict()) for m in result.missing_skills
        ],
        category_breakdown={
            k: CategoryScoreResponse(**v.to_dict())
            for k, v in result.category_breakdown.items()
        },
        overall_readiness_score=result.overall_readiness_score,
    )
    return APIResponse(data=response)


@router.get("/jobs/titles", response_model=APIResponse[JobTitleListResponse])
async def list_job_titles(
    service: SkillGapService = Depends(get_skill_gap_service),
):
    titles = service.get_available_titles()
    return APIResponse(data=JobTitleListResponse(job_titles=titles, total=len(titles)))
