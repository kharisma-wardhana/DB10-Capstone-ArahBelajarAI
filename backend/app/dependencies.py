"""FastAPI dependency injection providers."""

from app.config import Settings, get_settings
from app.core.ml_registry import ml_registry
from app.exceptions import ModelNotReadyError
from app.services.interview_service import InterviewService
from app.services.learning_roadmap_service import LearningRoadmapService
from app.services.skill_demand_service import SkillDemandService
from app.services.skill_extraction_service import SkillExtractionService
from app.services.skill_gap_service import SkillGapService


def get_config() -> Settings:
    return get_settings()


def get_skill_extraction_service() -> SkillExtractionService:
    if ml_registry.skill_extractor is None:
        raise ModelNotReadyError()
    return SkillExtractionService(ml_registry.skill_extractor)


def get_skill_gap_service() -> SkillGapService:
    if ml_registry.skill_gap_analyzer is None:
        raise ModelNotReadyError()
    return SkillGapService(ml_registry.skill_gap_analyzer)


def get_skill_demand_service() -> SkillDemandService:
    if ml_registry.skill_demand_service is None:
        raise ModelNotReadyError()
    return ml_registry.skill_demand_service


def get_learning_roadmap_service() -> LearningRoadmapService:
    if ml_registry.learning_roadmap_service is None or not ml_registry.learning_roadmap_service.is_ready:
        raise ModelNotReadyError()
    return ml_registry.learning_roadmap_service


def get_interview_service() -> InterviewService:
    settings = get_settings()
    return InterviewService(
        api_key=settings.OPENAI_API_KEY,
        model_name=settings.OPENAI_MODEL,
        temperature=settings.OPENAI_TEMPERATURE,
    )
