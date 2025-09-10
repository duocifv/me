"""
Memory Service for session-based conversation memory management
Handles short-term session memory using LangChain ConversationBufferMemory
"""

from langchain.memory import ConversationBufferMemory
from typing import Dict


class MemoryService:
    """Service for managing session-based conversation memory"""
    
    def __init__(self):
        """Initialize memory service with session storage"""
        self.sessions: Dict[str, ConversationBufferMemory] = {}
    
    def get_session_memory(self, session_id: str) -> ConversationBufferMemory:
        """Get or create session memory for a given session ID"""
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
        return self.sessions[session_id]
    
    def save_conversation(self, session_id: str, question: str, response: str):
        """Save a conversation turn to session memory"""
        memory = self.get_session_memory(session_id)
        memory.save_context({"input": question}, {"output": response})
    
    def get_chat_history(self, session_id: str) -> str:
        """Get formatted chat history for a session"""
        memory = self.get_session_memory(session_id)
        if hasattr(memory, 'buffer_as_str'):
            return memory.buffer_as_str
        return ""
    
    def clear_session(self, session_id: str):
        """Clear session memory if needed"""
        if session_id in self.sessions:
            del self.sessions[session_id]
    
    def get_session_count(self) -> int:
        """Get the number of active sessions"""
        return len(self.sessions)
