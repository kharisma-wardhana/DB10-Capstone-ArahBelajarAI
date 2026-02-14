"""Skill extraction endpoint."""

from fastapi import APIRouter, Depends

from app.dependencies import get_skill_extraction_service
from app.schemas.common import APIResponse
from app.schemas.skill_extraction import (
    ExtractedSkillResponse,
    SkillExtractionRequest,
    SkillExtractionResponse,
)
from app.services.skill_extraction_service import SkillExtractionService

router = APIRouter()


@router.post("/skills/extract", response_model=APIResponse[SkillExtractionResponse])
async def extract_skills(
    request: SkillExtractionRequest,
    service: SkillExtractionService = Depends(get_skill_extraction_service),
):
    matches = service.extract_skills(request.text, request.mode)
    response = SkillExtractionResponse(
        skills=[
            ExtractedSkillResponse(
                skill_name=m.skill_name,
                skill_id=m.skill_id,
                category=m.category,
                confidence=round(m.confidence, 4),
                matched_from=m.matched_from,
            )
            for m in matches
        ],
        total_found=len(matches),
        input_mode=request.mode.value,
    )
    return APIResponse(data=response)
