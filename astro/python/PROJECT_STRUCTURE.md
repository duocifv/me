# AI Chatbot System - Project Structure

## 📁 Professional Modular Architecture

```
chatbot-system/
├── main.py                 # Main entry point and FastAPI app initialization
├── requirements.txt        # Python dependencies with compatible versions
├── PROJECT_STRUCTURE.md    # This file - project overview
├── README.md              # Updated documentation for modular system
│
├── config/                # Configuration management
│   ├── __init__.py
│   └── settings.py        # Centralized settings with environment variables
│
├── models/                # Pydantic models and schemas
│   ├── __init__.py
│   └── schemas.py         # API request/response models
│
├── services/              # Business logic and service layer
│   ├── __init__.py
│   ├── llm_service.py     # Gemini LLM integration and prompt management
│   ├── tools_service.py   # 5 demo tools with built-in data
│   ├── memory_service.py  # Session-based conversation memory
│   └── vector_service.py  # ChromaDB and RAG functionality
│
├── core/                  # Core business logic
│   ├── __init__.py
│   └── agent.py           # Main AI agent orchestrating the system
│
└── api/                   # FastAPI routes and endpoints
    ├── __init__.py
    └── routes.py          # API endpoints (/chat, /health, /)
```

## 🏗️ Architecture Overview

### **Separation of Concerns**
- **Config**: Centralized configuration with environment variable support
- **Models**: Pydantic schemas for type safety and validation
- **Services**: Business logic separated by domain (LLM, Tools, Memory, Vector)
- **Core**: Main orchestration logic (AI Agent)
- **API**: FastAPI routes and HTTP handling

### **Key Features**
- **Modular Design**: Each component is independently maintainable
- **Professional Structure**: Follows 2025 Python best practices
- **Scalable**: Easy to extend with new tools, services, or endpoints
- **Type Safety**: Full Pydantic model validation
- **Configuration Management**: Environment-based settings
- **Error Handling**: Comprehensive error management at each layer

## 🚀 Running the System

### **Quick Start**
```bash
# Install dependencies
pip install -r requirements.txt

# Set your Google API key
export GOOGLE_API_KEY="your-api-key-here"

# Run the server
python main.py
```

### **API Endpoints**
- `POST /chat` - Main chat interface
- `GET /health` - Health check
- `GET /` - API information
- `GET /docs` - Auto-generated API documentation

## 🔧 Extending the System

### **Adding New Tools**
1. Add method to `services/tools_service.py`
2. Update tool execution logic
3. Add to intent analysis prompt in `services/llm_service.py`

### **Adding New Services**
1. Create new service file in `services/`
2. Import in `services/__init__.py`
3. Initialize in `core/agent.py`

### **Configuration Changes**
- Modify `config/settings.py` for new settings
- Use environment variables for sensitive data

## 📊 Benefits of This Structure

1. **Maintainability**: Clear separation makes debugging easier
2. **Testability**: Each service can be unit tested independently
3. **Scalability**: Easy to add new features without affecting existing code
4. **Professional**: Follows industry standards for Python projects
5. **Deployment Ready**: Structured for production deployment
