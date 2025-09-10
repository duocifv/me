"""
Core AI Agent that orchestrates the entire chatbot system
Handles the main processing pipeline: intent analysis, tool execution, RAG, and response generation
"""

import uuid
from typing import List
from models.schemas import ChatResponse
from services import LLMService, ToolsService, MemoryService, VectorService


class AIAgent:
    """Main AI agent that orchestrates the entire chatbot system"""
    
    def __init__(self):
        """Initialize all services"""
        self.llm_service = LLMService()
        self.tools_service = ToolsService()
        self.memory_service = MemoryService()
        self.vector_service = VectorService()
    
    def process_query(self, question: str, session_id: str) -> ChatResponse:
        """
        Main processing pipeline:
        1. Intent Analysis
        2. Tool Execution or RAG Search
        3. RAG Enhancement (if needed)
        4. Response Generation
        5. Memory Storage
        """
        try:
            # Get chat history for context
            chat_history = self.memory_service.get_chat_history(session_id)
            
            # Step 1: Intent Analysis
            selected_tool = self.llm_service.analyze_intent(question)
            tool_used = selected_tool  # Track the tool used
            
            # Step 2: Tool Execution or RAG Search
            if selected_tool == "rag_search":
                # Use RAG for complex queries
                retrieved_docs = self.vector_service.retrieve_relevant_docs(question)
                if retrieved_docs:
                    tool_response = f"Based on the knowledge base: {' '.join(retrieved_docs[:2])}"
                    sources = ["Chroma DB"]
                else:
                    tool_response = "I don't have specific information about that topic in my knowledge base."
                    sources = ["General Knowledge"]
            else:
                # Execute specific tool
                tool_response, sources = self.tools_service.execute_tool(selected_tool, question)
            
            # Step 3: RAG Enhancement (if tool response is insufficient)
            retrieved_context = ""
            if selected_tool != "rag_search" and len(tool_response) < 50:
                retrieved_docs = self.vector_service.retrieve_relevant_docs(question)
                if retrieved_docs:
                    retrieved_context = " ".join(retrieved_docs)
                    if "Chroma DB" not in sources:
                        sources.append("Chroma DB")
            
            # Step 4: Response Generation
            final_response = self.llm_service.generate_response(
                question, selected_tool, tool_response, retrieved_context, chat_history
            )
            
            # Step 5: Memory Storage
            self.memory_service.save_conversation(session_id, question, final_response)
            
            # Return response including tool used
            return ChatResponse(
                answer=final_response,
                source=sources,
                session_id=session_id,
                tool_used=tool_used  # <-- mới thêm
            )
            
        except Exception as e:
            print(f"Processing error: {e}")
            return ChatResponse(
                answer="I apologize, but I encountered an error processing your request. Please try again.",
                source=["Error Handler"],
                session_id=session_id,
                tool_used="error"
            )
