"""
FastAPI routes and endpoints for the AI Chatbot System
Defines all API endpoints with proper error handling and validation
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse, HealthResponse, APIInfo
from core.agent import AIAgent

# Initialize router and AI agent
router = APIRouter()
ai_agent = AIAgent()


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main chat endpoint that processes user questions
    
    Args:
        request: ChatRequest containing question and optional session_id
        
    Returns:
        ChatResponse with answer, sources, and session_id
    """
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Process the query through the AI agent
        response = await ai_agent.process_query(request.question, session_id)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint to verify system status"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat()
    )


@router.get("/", response_model=APIInfo)
async def root():
    """Root endpoint with API information and usage examples"""
    return APIInfo(
        message="AI Chatbot System API with Gemini LLM",
        version="2.0.0",
        endpoints={
            "chat": "/chat - POST - Main chat interface",
            "health": "/health - GET - Health check",
            "docs": "/docs - GET - API documentation"
        },
        example_request={
            "url": "/chat",
            "method": "POST",
            "body": {"question": "Give me some health tips"}
        }
    )
