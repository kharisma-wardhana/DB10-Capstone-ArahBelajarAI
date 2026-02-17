"""Skill gap analysis endpoints."""

from fastapi import APIRouter, Depends

from app.dependencies import get_skill_demand_service, get_skill_gap_service
from app.schemas.common import APIResponse
from app.schemas.skill_gap import (
    CategoryScoreResponse,
    JobTitleListResponse,
    MatchedSkillResponse,
    MissingSkillResponse,
    SkillDemandTrend,
    SkillGapRequest,
    SkillGapResponse,
)
from app.services.skill_demand_service import SkillDemandService
from app.services.skill_gap_service import SkillGapService
from ml.src.skill_normalizer import parse_skills_csv

router = APIRouter()


def _build_trend(trend_data: dict | None) -> SkillDemandTrend | None:
    if trend_data is None:
        return None
    return SkillDemandTrend(
        predicted_trend=trend_data["predicted_trend"],
        confidence=trend_data["confidence"],
        growth_rate=trend_data["growth_rate"],
        current_demand=trend_data["current_demand"],
    )


@router.post("/skills/gap-analysis", response_model=APIResponse[SkillGapResponse])
async def analyze_skill_gap(
    request: SkillGapRequest,
    service: SkillGapService = Depends(get_skill_gap_service),
    demand_service: SkillDemandService = Depends(get_skill_demand_service),
):
    user_skill_names = parse_skills_csv(request.user_skills)
    result = service.analyze_gap(user_skill_names, request.job_title)

    # Enrich matched skills with demand trends
    matched_skills = []
    for m in result.matched_skills:
        d = m.to_dict()
        trend_data = demand_service.get_trend(d["required_skill"])
        d["demand_trend"] = _build_trend(trend_data)
        matched_skills.append(MatchedSkillResponse(**d))

    # Enrich missing skills with demand trends and priority scores
    missing_skills = []
    for m in result.missing_skills:
        d = m.to_dict()
        trend_data = demand_service.get_trend(d["skill_name"])
        d["demand_trend"] = _build_trend(trend_data)
        if trend_data is not None:
            d["priority_score"] = demand_service.compute_priority_score(
                frequency=d["frequency"],
                growth_rate=trend_data["growth_rate"],
            )
        else:
            d["priority_score"] = d["frequency"]  # fallback to frequency
        missing_skills.append(MissingSkillResponse(**d))

    # Sort missing skills by priority score (highest first)
    missing_skills.sort(key=lambda s: s.priority_score or 0, reverse=True)

    response = SkillGapResponse(
        job_title_matched=result.job_title_matched,
        job_title_confidence=result.job_title_confidence,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
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
