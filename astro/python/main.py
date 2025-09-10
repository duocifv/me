"""
Main entry point for the AI Chatbot System
Initializes FastAPI application and starts the server
"""

import uvicorn
from fastapi import FastAPI
from api.routes import router
from config.settings import settings


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="AI Chatbot System with Gemini LLM, LangChain, ChromaDB, and RAG",
        debug=settings.debug
    )
    
    # Include API routes
    app.include_router(router)
    
    return app


# Create FastAPI app instance
app = create_app()


if __name__ == "__main__":
    print("🚀 Starting AI Chatbot System with Gemini LLM...")
    print("📝 Features: LangChain, Gemini Pro, FastAPI, ChromaDB, RAG")
    print("🔧 Tools: Blog, Health, Hydroponics, Tips, Fun Facts")
    print("💾 Memory: Session-based conversation memory")
    print(f"🌐 API: http://{settings.host}:{settings.port}")
    print(f"📚 Docs: http://{settings.host}:{settings.port}/docs")
    print("\n⚠️  Remember to set your GOOGLE_API_KEY for Gemini!")
    print("🔑 Get your free API key at: https://makersuite.google.com/app/apikey")
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload
    )
