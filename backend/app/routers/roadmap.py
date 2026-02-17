"""Learning roadmap generation endpoints."""

from fastapi import APIRouter, Depends

from app.dependencies import get_learning_roadmap_service
from app.schemas.common import APIResponse
from app.schemas.roadmap import RoadmapRequest, RoadmapResponse
from app.services.learning_roadmap_service import LearningRoadmapService

router = APIRouter()


@router.post("/roadmap/generate", response_model=APIResponse[RoadmapResponse])
async def generate_roadmap(
    request: RoadmapRequest,
    service: LearningRoadmapService = Depends(get_learning_roadmap_service),
):
    result = service.generate_roadmap(
        missing_skills=request.missing_skills,
        vak_style=request.vak_style,
    )
    return APIResponse(data=RoadmapResponse(**result))
