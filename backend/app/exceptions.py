"""Custom exception classes and FastAPI exception handlers."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code


class ModelNotReadyError(AppException):
    def __init__(self):
        super().__init__("ML models are not loaded yet", status_code=503)


class SkillExtractionError(AppException):
    def __init__(self, detail: str = "Skill extraction failed"):
        super().__init__(detail, status_code=422)


class JobTitleNotFoundError(AppException):
    def __init__(self, job_title: str):
        super().__init__(f"No matching job title found for: {job_title}", status_code=404)


class InterviewSessionNotFoundError(AppException):
    def __init__(self, session_id: str):
        super().__init__(f"Interview session not found: {session_id}", status_code=404)


class OpenAIError(AppException):
    def __init__(self, detail: str = "OpenAI API error"):
        super().__init__(detail, status_code=502)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": exc.message, "data": None},
        )
