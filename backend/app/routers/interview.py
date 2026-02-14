"""Mock interview endpoints with SSE streaming."""

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.dependencies import get_interview_service
from app.exceptions import InterviewSessionNotFoundError
from app.schemas.common import APIResponse
from app.schemas.interview import (
    ChatMessageRequest,
    InterviewFeedbackResponse,
    InterviewStartRequest,
    InterviewStartResponse,
)
from app.services.interview_service import InterviewService

router = APIRouter()


@router.post("/interview/start", response_model=APIResponse[InterviewStartResponse])
async def start_interview(
    request: InterviewStartRequest,
    service: InterviewService = Depends(get_interview_service),
):
    session_id, first_question = service.start_session(
        job_role=request.job_role,
        user_skills=request.user_skills,
        language=request.language,
    )
    return APIResponse(data=InterviewStartResponse(
        session_id=session_id,
        job_role=request.job_role,
        first_question=first_question,
    ))


@router.post("/interview/{session_id}/chat")
async def interview_chat(
    session_id: str,
    request: ChatMessageRequest,
    service: InterviewService = Depends(get_interview_service),
):
    try:
        return StreamingResponse(
            service.chat_stream(session_id, request.message),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except KeyError:
        raise InterviewSessionNotFoundError(session_id)


@router.get(
    "/interview/{session_id}/feedback",
    response_model=APIResponse[InterviewFeedbackResponse],
)
async def get_interview_feedback(
    session_id: str,
    service: InterviewService = Depends(get_interview_service),
):
    try:
        session = service.get_session_info(session_id)
        feedback = service.get_feedback(session_id)
    except KeyError:
        raise InterviewSessionNotFoundError(session_id)

    return APIResponse(data=InterviewFeedbackResponse(
        session_id=session_id,
        job_role=session.job_role,
        **feedback,
    ))
