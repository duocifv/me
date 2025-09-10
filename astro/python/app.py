"""
AI Chatbot System with LangChain, Gemini LLM, FastAPI, ChromaDB, and RAG
A complete production-ready AI system with intent analysis, tool selection, and memory management.
"""

import os
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio

# FastAPI imports
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate, ChatPromptTemplate
from langchain.chains import LLMChain
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.memory import ConversationBufferMemory
from langchain.schema import BaseRetriever, Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.document_loaders import TextLoader
from langchain.output_parsers import PydanticOutputParser, OutputFixingParser
from langchain.schema.output_parser import StrOutputParser

# ChromaDB imports
import chromadb
from chromadb.config import Settings

# Set Google API key for Gemini (replace with your actual key)
os.environ["GOOGLE_API_KEY"] = "your-google-api-key-here"

# =============================================================================
# 1. FASTAPI SETUP AND MODELS
# =============================================================================

app = FastAPI(title="AI Chatbot System", version="1.0.0")

class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    source: List[str]
    session_id: str

# =============================================================================
# 2. DEMO TOOLS WITH BUILT-IN DATA
# =============================================================================

class DemoTools:
    """Collection of demo tools with built-in example data"""
    
    @staticmethod
    def blog_tool(query: str) -> str:
        """Generate blog title suggestions and content ideas"""
        blog_data = {
            "ai": ["10 AI Trends That Will Shape 2025", "Building Your First AI Chatbot", "The Future of Machine Learning"],
            "health": ["5 Morning Habits for Better Health", "Nutrition Myths Debunked", "Mental Health in the Digital Age"],
            "technology": ["Cloud Computing Best Practices", "Cybersecurity for Small Businesses", "The Rise of Edge Computing"],
            "productivity": ["Time Management Techniques That Actually Work", "Building Better Habits", "The Art of Deep Work"]
        }
        
        query_lower = query.lower()
        for category, titles in blog_data.items():
            if category in query_lower:
                return f"Blog suggestions for {category}: {', '.join(titles[:2])}"
        
        return "General blog ideas: 'How to Stay Productive While Working Remote', 'The Power of Continuous Learning'"

    @staticmethod
    def health_tool(query: str) -> str:
        """Provide health tips and wellness advice"""
        health_tips = {
            "exercise": "Aim for 150 minutes of moderate aerobic activity weekly. Include strength training twice a week.",
            "nutrition": "Follow the 80/20 rule: eat nutritious foods 80% of the time, allow treats 20% of the time.",
            "sleep": "Maintain 7-9 hours of sleep nightly. Create a consistent bedtime routine and avoid screens 1 hour before bed.",
            "stress": "Practice deep breathing exercises, meditation, or yoga. Take regular breaks throughout your day.",
            "hydration": "Drink 8-10 glasses of water daily. Start your morning with a glass of water to kickstart hydration."
        }
        
        query_lower = query.lower()
        for category, tip in health_tips.items():
            if category in query_lower:
                return f"Health tip for {category}: {tip}"
        
        return "General health tip: Take a 10-minute walk after meals to aid digestion and boost energy levels."

    @staticmethod
    def hydroponics_tool(query: str) -> str:
        """Provide hydroponic gardening guidance"""
        hydroponic_data = {
            "nutrients": "Use a balanced NPK solution (20-20-20) for most plants. Monitor EC levels between 1.2-2.0.",
            "ph": "Maintain pH between 5.5-6.5 for optimal nutrient uptake. Check and adjust daily.",
            "lighting": "Provide 14-16 hours of LED light daily for leafy greens, 12 hours for fruiting plants.",
            "water": "Change nutrient solution every 2-3 weeks. Maintain water temperature between 65-75°F.",
            "beginner": "Start with lettuce, spinach, or herbs. These are forgiving and grow quickly in hydroponic systems."
        }
        
        query_lower = query.lower()
        for category, advice in hydroponic_data.items():
            if category in query_lower:
                return f"Hydroponics advice for {category}: {advice}"
        
        return "General hydroponics tip: Ensure proper air circulation to prevent mold and promote healthy plant growth."

    @staticmethod
    def tips_tool(query: str) -> str:
        """Provide quick tips on various topics"""
        tips_database = {
            "productivity": "Use the Pomodoro Technique: 25 minutes focused work, 5-minute break. Repeat 4 times, then take a longer break.",
            "coding": "Follow the DRY principle (Don't Repeat Yourself) and write clean, readable code with meaningful variable names.",
            "learning": "Use active recall and spaced repetition. Teach concepts to others to solidify your understanding.",
            "communication": "Listen actively, ask clarifying questions, and summarize key points to ensure understanding.",
            "finance": "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings and debt repayment."
        }
        
        query_lower = query.lower()
        for category, tip in tips_database.items():
            if category in query_lower:
                return f"Quick tip for {category}: {tip}"
        
        return "General tip: Break large tasks into smaller, manageable chunks to reduce overwhelm and increase progress."

    @staticmethod
    def fun_fact_tool(query: str) -> str:
        """Share interesting fun facts"""
        fun_facts = [
            "Octopuses have three hearts and blue blood!",
            "A group of flamingos is called a 'flamboyance'.",
            "Honey never spoils - archaeologists have found edible honey in ancient Egyptian tombs.",
            "Bananas are berries, but strawberries aren't!",
            "A single cloud can weigh more than a million pounds.",
            "Sharks have been around longer than trees.",
            "The human brain uses about 20% of the body's total energy.",
            "There are more possible games of chess than atoms in the observable universe.",
            "Wombat poop is cube-shaped!",
            "A day on Venus is longer than its year."
        ]
        
        import random
        return f"Fun fact: {random.choice(fun_facts)}"

# =============================================================================
# 3. CHROMADB SETUP AND RAG FUNCTIONALITY
# =============================================================================

class ChromaDBManager:
    """Manages ChromaDB operations for RAG functionality"""
    
    def __init__(self):
        self.client = chromadb.Client(Settings(anonymized_telemetry=False))
        # Use free HuggingFace embeddings instead of OpenAI
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        self.collection_name = "knowledge_base"
        self.setup_knowledge_base()
    
    def setup_knowledge_base(self):
        """Initialize ChromaDB with sample knowledge base"""
        try:
            # Delete existing collection if it exists
            try:
                self.client.delete_collection(self.collection_name)
            except:
                pass
            
            # Create new collection
            collection = self.client.create_collection(self.collection_name)
            
            # Sample knowledge base documents
            documents = [
                "Artificial Intelligence is transforming industries through machine learning, natural language processing, and computer vision technologies.",
                "Hydroponic systems allow plants to grow without soil by providing nutrients directly through water solutions.",
                "Regular exercise improves cardiovascular health, strengthens muscles, and enhances mental well-being.",
                "Effective time management involves prioritizing tasks, setting clear goals, and eliminating distractions.",
                "Proper nutrition includes a balanced diet with fruits, vegetables, lean proteins, and whole grains.",
                "Mental health is as important as physical health and requires attention, care, and professional support when needed.",
                "Sustainable living practices help protect the environment and conserve resources for future generations.",
                "Continuous learning and skill development are essential for personal and professional growth in today's rapidly changing world."
            ]
            
            # Add documents to ChromaDB
            for i, doc in enumerate(documents):
                collection.add(
                    documents=[doc],
                    ids=[f"doc_{i}"],
                    metadatas=[{"source": f"knowledge_base_{i}"}]
                )
            
            self.vectorstore = Chroma(
                client=self.client,
                collection_name=self.collection_name,
                embedding_function=self.embeddings
            )
            
        except Exception as e:
            print(f"ChromaDB setup error: {e}")
            # Fallback: create empty vectorstore
            self.vectorstore = None
    
    def retrieve_relevant_docs(self, query: str, k: int = 3) -> List[str]:
        """Retrieve relevant documents from ChromaDB"""
        if not self.vectorstore:
            return []
        
        try:
            docs = self.vectorstore.similarity_search(query, k=k)
            return [doc.page_content for doc in docs]
        except Exception as e:
            print(f"Retrieval error: {e}")
            return []

# =============================================================================
# 4. MEMORY MANAGEMENT
# =============================================================================

class MemoryManager:
    """Manages short-term session memory"""
    
    def __init__(self):
        self.sessions = {}  # Short-term session memory only
    
    def get_session_memory(self, session_id: str) -> ConversationBufferMemory:
        """Get or create session memory"""
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
        return self.sessions[session_id]
    
    def clear_session(self, session_id: str):
        """Clear session memory if needed"""
        if session_id in self.sessions:
            del self.sessions[session_id]

# =============================================================================
# 5. LLM WRAPPER AND PROMPT TEMPLATES
# =============================================================================

class LLMManager:
    """Manages Gemini LLM operations and prompt templates"""
    
    def __init__(self):
        # Initialize Gemini LLM (free version)
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            temperature=0.7,
            convert_system_message_to_human=True
        )
        self.intent_analyzer = ChatGoogleGenerativeAI(
            model="gemini-pro",
            temperature=0,
            convert_system_message_to_human=True
        )
        self.setup_prompts()
    
    def setup_prompts(self):
        """Initialize prompt templates"""
        
        # Intent analysis prompt optimized for Gemini
        self.intent_prompt = ChatPromptTemplate.from_template("""
        You are an intelligent tool selector. Analyze the user's question and choose the most appropriate tool.
        
        Available tools:
        - blog_tool: Blog suggestions, content ideas, writing topics
        - health_tool: Health tips, wellness advice, medical information  
        - hydroponics_tool: Hydroponic gardening, plant growing advice
        - tips_tool: General tips, productivity, learning advice
        - fun_fact_tool: Interesting facts, trivia, entertainment
        - rag_search: Complex questions needing knowledge base search
        
        User question: {question}
        
        Respond with ONLY the tool name (e.g., "blog_tool" or "rag_search").
        Choose "rag_search" for complex or unclear questions.
        """)
        
        # Response generation prompt optimized for Gemini
        self.response_prompt = ChatPromptTemplate.from_template("""
        You are a helpful AI assistant. Create a natural, conversational response using this information:
        
        User Question: {question}
        Tool Used: {tool_used}
        Tool Response: {tool_response}
        Retrieved Context: {retrieved_context}
        Chat History: {chat_history}
        
        Generate a response that:
        - Directly answers the user's question
        - Uses information from the tool and context
        - Is natural and engaging
        - Provides practical advice
        
        Keep the response concise but complete.
        """)

# =============================================================================
# 6. LANGCHAIN AGENT AND TOOL INTEGRATION
# =============================================================================

class AIAgent:
    """Main AI agent that orchestrates the entire system"""
    
    def __init__(self):
        self.llm_manager = LLMManager()
        self.chroma_manager = ChromaDBManager()
        self.memory_manager = MemoryManager()
        self.demo_tools = DemoTools()
        self.setup_tools()
    
    def setup_tools(self):
        """Setup LangChain tools"""
        self.tools = [
            Tool(
                name="blog_tool",
                func=self.demo_tools.blog_tool,
                description="Use this tool for blog suggestions, content ideas, and writing topics"
            ),
            Tool(
                name="health_tool",
                func=self.demo_tools.health_tool,
                description="Use this tool for health tips, wellness advice, and medical information"
            ),
            Tool(
                name="hydroponics_tool",
                func=self.demo_tools.hydroponics_tool,
                description="Use this tool for hydroponic gardening and plant growing advice"
            ),
            Tool(
                name="tips_tool",
                func=self.demo_tools.tips_tool,
                description="Use this tool for general tips, productivity advice, and learning strategies"
            ),
            Tool(
                name="fun_fact_tool",
                func=self.demo_tools.fun_fact_tool,
                description="Use this tool for interesting facts, trivia, and entertainment"
            )
        ]
    
    def analyze_intent(self, question: str) -> str:
        """Analyze user intent and select appropriate tool"""
        try:
            chain = self.llm_manager.intent_prompt | self.llm_manager.intent_analyzer | StrOutputParser()
            tool_name = chain.invoke({"question": question}).strip().lower()
            
            # Validate tool name
            valid_tools = ["blog_tool", "health_tool", "hydroponics_tool", "tips_tool", "fun_fact_tool", "rag_search"]
            if tool_name not in valid_tools:
                return "rag_search"
            
            return tool_name
        except Exception as e:
            print(f"Intent analysis error: {e}")
            return "rag_search"
    
    def execute_tool(self, tool_name: str, query: str) -> tuple[str, List[str]]:
        """Execute the selected tool and return response with sources"""
        sources = []
        
        if tool_name == "rag_search":
            # Use RAG for complex queries
            retrieved_docs = self.chroma_manager.retrieve_relevant_docs(query)
            if retrieved_docs:
                response = f"Based on the knowledge base: {' '.join(retrieved_docs[:2])}"
                sources = ["Chroma DB"]
            else:
                response = "I don't have specific information about that topic in my knowledge base."
                sources = ["General Knowledge"]
        else:
            # Execute specific tool
            tool_func = getattr(self.demo_tools, tool_name)
            response = tool_func(query)
            sources = [tool_name.replace("_", " ").title()]
        
        return response, sources
    
    def generate_response(self, question: str, tool_used: str, tool_response: str, 
                         retrieved_context: str, chat_history: str) -> str:
        """Generate final response using LLM"""
        try:
            chain = self.llm_manager.response_prompt | self.llm_manager.llm | StrOutputParser()
            response = chain.invoke({
                "question": question,
                "tool_used": tool_used,
                "tool_response": tool_response,
                "retrieved_context": retrieved_context,
                "chat_history": chat_history
            })
            return response
        except Exception as e:
            print(f"Response generation error: {e}")
            return tool_response  # Fallback to tool response
    
    async def process_query(self, question: str, session_id: str) -> ChatResponse:
        """Main processing pipeline"""
        try:
            # Get session memory
            memory = self.memory_manager.get_session_memory(session_id)
            chat_history = memory.buffer_as_str if hasattr(memory, 'buffer_as_str') else ""
            
            # Step 1: Intent Analysis
            selected_tool = self.analyze_intent(question)
            
            # Step 2: Tool Execution
            tool_response, sources = self.execute_tool(selected_tool, question)
            
            # Step 3: RAG Enhancement (if needed)
            retrieved_context = ""
            if selected_tool == "rag_search" or len(tool_response) < 50:
                retrieved_docs = self.chroma_manager.retrieve_relevant_docs(question)
                if retrieved_docs:
                    retrieved_context = " ".join(retrieved_docs)
                    if "Chroma DB" not in sources:
                        sources.append("Chroma DB")
            
            # Step 4: Response Generation
            final_response = self.generate_response(
                question, selected_tool, tool_response, retrieved_context, chat_history
            )
            
            # Step 5: Memory Management (session only)
            memory.save_context({"input": question}, {"output": final_response})
            
            return ChatResponse(
                answer=final_response,
                source=sources,
                session_id=session_id
            )
            
        except Exception as e:
            print(f"Processing error: {e}")
            return ChatResponse(
                answer="I apologize, but I encountered an error processing your request. Please try again.",
                source=["Error Handler"],
                session_id=session_id
            )

# =============================================================================
# 7. FASTAPI ENDPOINTS
# =============================================================================

# Initialize the AI agent
ai_agent = AIAgent()

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint that processes user questions"""
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Process the query
        response = await ai_agent.process_query(request.question, session_id)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Chatbot System API",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat - POST - Main chat interface",
            "health": "/health - GET - Health check",
            "docs": "/docs - GET - API documentation"
        },
        "example_request": {
            "url": "/chat",
            "method": "POST",
            "body": {"question": "Give me some health tips"}
        }
    }

# =============================================================================
# 8. MAIN APPLICATION RUNNER
# =============================================================================

if __name__ == "__main__":
    print("🚀 Starting AI Chatbot System with Gemini LLM...")
    print("📝 Features: LangChain, Gemini Pro, FastAPI, ChromaDB, RAG")
    print("🔧 Tools: Blog, Health, Hydroponics, Tips, Fun Facts")
    print("💾 Memory: Session-based conversation memory")
    print("🌐 API: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("\n⚠️  Remember to set your GOOGLE_API_KEY for Gemini!")
    print("🔑 Get your free API key at: https://makersuite.google.com/app/apikey")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
