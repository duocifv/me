"""
Configuration settings for the AI Chatbot System
Centralized configuration management for all components
"""

import os
from typing import Optional
from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # API Configuration
    app_name: str = "AI Chatbot System"
    app_version: str = "2.0.0"
    debug: bool = False
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True
    
    # LLM Configuration
    google_api_key: Optional[str] = None
    gemini_model: str = "gemini-pro"
    llm_temperature: float = 0.7
    intent_temperature: float = 0.0
    
    # ChromaDB Configuration
    chroma_collection_name: str = "knowledge_base"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Memory Configuration
    max_memory_tokens: int = 2000
    
    class Config:
        env_file = ".env"
        env_prefix = "CHATBOT_"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set Google API key from environment if not provided
        if not self.google_api_key:
            self.google_api_key = os.getenv("GOOGLE_API_KEY", "AIzaSyD46ycGuCHOchk3v6zr3fPsRRKoq2hsfcs")


# Global settings instance
settings = Settings()
