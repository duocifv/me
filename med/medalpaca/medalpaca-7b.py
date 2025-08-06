from fastapi import FastAPI, Request
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch

app = FastAPI()

# Sử dụng mô hình Medalpaca 7B từ Hugging Face
model_id = "medalpaca/medalpaca-7b"

# Load tokenizer và model
tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto" if torch.cuda.is_available() else None,
)

# Tạo pipeline để sinh văn bản
pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    device=0 if torch.cuda.is_available() else -1,
)

@app.get("/")
def root():
    return {"message": "MedAlpaca-7B model is ready."}

@app.post("/ask")
async def ask(request: Request):
    data = await request.json()
    text = data.get("text", "")

    if not text:
        return {"error": "Missing 'text' in request body"}

    # Tạo prompt theo định dạng chuẩn của Alpaca
    prompt = f"### Instruction:\n{text}\n\n### Response:"

    result = pipe(
        prompt,
        max_new_tokens=300,
        do_sample=True,
        temperature=0.7,
        top_p=0.9,
    )

    return {
        "input": text,
        "output": result[0]["generated_text"]
    }
