from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    TicketAnalysisRequest,
    TicketAnalysisResponse,
    SuggestResponseRequest,
    SuggestResponseOutput,
)
from app.services.gemini_service import (
    analyze_ticket_with_gemini,
    suggest_response_with_gemini,
    is_gemini_active,
)

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint for AI microservice
    """
    return {
        "status": "healthy",
        "service": "ai-customer-support-microservice",
        "gemini_active": is_gemini_active(),
    }


@router.post(
    "/api/ai/analyze-ticket",
    response_model=TicketAnalysisResponse,
    status_code=status.HTTP_200_OK,
)
async def analyze_ticket(payload: TicketAnalysisRequest):
    """
    Analyzes ticket subject and description for category, priority, sentiment, summary, and suggested reply.
    """
    try:
        result = await analyze_ticket_with_gemini(payload.subject, payload.description)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing ticket: {str(e)}",
        )


@router.post(
    "/api/ai/suggest-response",
    response_model=SuggestResponseOutput,
    status_code=status.HTTP_200_OK,
)
async def suggest_response(payload: SuggestResponseRequest):
    """
    Suggests smart response based on ticket conversation history.
    """
    try:
        messages_list = [m.model_dump() for m in (payload.messages or [])]
        result = await suggest_response_with_gemini(
            payload.subject, payload.description, messages_list
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating suggested response: {str(e)}",
        )
