"""
LLM Service for Gemini integration and prompt management
Handles all LLM operations including intent analysis and response generation
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from config.settings import settings


class LLMService:
    """Service for managing Gemini LLM operations and prompt templates"""
    
    def __init__(self):
        """Initialize Gemini LLM instances and prompt templates"""
        self.llm = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            temperature=settings.llm_temperature,
            google_api_key=settings.google_api_key,
            convert_system_message_to_human=True
        )
        
        self.intent_analyzer = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            temperature=settings.intent_temperature,
            google_api_key=settings.google_api_key,
            convert_system_message_to_human=True
        )
        
        self._setup_prompts()
    
    def _setup_prompts(self):
        """Initialize prompt templates optimized for Gemini"""
        
        # Intent analysis prompt
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
        
        # Response generation prompt
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
    
    def analyze_intent(self, question: str) -> str:
        """Analyze user intent and select appropriate tool"""
        try:
            chain = self.intent_prompt | self.intent_analyzer | StrOutputParser()
            tool_name = chain.invoke({"question": question}).strip().lower()
            
            # Validate tool name
            valid_tools = ["blog_tool", "health_tool", "hydroponics_tool", 
                          "tips_tool", "fun_fact_tool", "rag_search"]
            if tool_name not in valid_tools:
                return "rag_search"
            
            return tool_name
        except Exception as e:
            print(f"Intent analysis error: {e}")
            return "rag_search"
    
    def generate_response(self, question: str, tool_used: str, tool_response: str, 
                         retrieved_context: str, chat_history: str) -> str:
        """Generate final response using LLM"""
        try:
            chain = self.response_prompt | self.llm | StrOutputParser()
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
