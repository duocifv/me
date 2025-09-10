"""
Pydantic models and schemas for API requests and responses
"""

from typing import List, Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    question: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    answer: str
    source: List[str]
    session_id: str


class HealthResponse(BaseModel):
    """Response model for health check endpoint"""
    status: str
    timestamp: str


class APIInfo(BaseModel):
    """Response model for root endpoint"""
    message: str
    version: str
    endpoints: dict
    example_request: dict
