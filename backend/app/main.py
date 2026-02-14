"""FastAPI application factory with lifespan for ML model loading."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.core.ml_registry import ml_registry
from app.exceptions import register_exception_handlers
from app.routers import health, interview, skill_extraction, skill_gap

logger = logging.getLogger(__name__)

API_V1_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info("Loading ML models...")
    ml_registry.initialize(
        chroma_host=settings.CHROMA_HOST,
        chroma_port=settings.CHROMA_PORT,
        model_name=settings.EMBEDDING_MODEL_NAME,
    )
    logger.info("ML models loaded successfully.")
    yield
    logger.info("Shutting down.")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    app.include_router(health.router)
    app.include_router(skill_extraction.router, prefix=API_V1_PREFIX, tags=["Skills"])
    app.include_router(skill_gap.router, prefix=API_V1_PREFIX, tags=["Skills"])
    app.include_router(interview.router, prefix=API_V1_PREFIX, tags=["Interview"])

    return app


app = create_app()
