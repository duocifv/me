src/
├─ ai/
│ ├─ llm.service.ts (LLM core)
│ ├─ rag.service.ts (Embedding + Vector search)
│ ├─ reasoning.service.ts (Self-Ask / planning)
│ ├─ mcp.service.ts (Function calling / API)
│ ├─ agent.service.ts (Agent logic)
│ └─ orchestrator.service.ts (Orchestrator + Guardrails + Eval)
└─ app.controller.ts

LLM (não gốc)
↓
Prompting / Prompt chaining
↓
Embedding → RAG → Memory (trí nhớ + kiến thức thật)
↓
Self-Ask / Reasoning (chia nhỏ vấn đề)
↓
Function Calling / MCP (gọi API, tool)
↓
Fine-tuning / LoRA / Distillation (custom model)
↓
Agent (tự hành động)
↓
Multi-Agent (teamwork)
↓
Orchestrator + Guardrails + Evaluation
