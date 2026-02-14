"""Health check endpoints."""

from fastapi import APIRouter

from app.core.ml_registry import ml_registry

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/ready")
async def readiness():
    ready = ml_registry.skill_extractor is not None
    return {"ready": ready, "status": "ok" if ready else "loading"}
