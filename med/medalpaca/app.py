from fastapi import FastAPI, Request
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch

app = FastAPI()

model_id = "medalpaca/medalpaca-7b"

tokenizer = AutoTokenizer.from_pretrained(
    model_id,
    use_fast=True,
    legacy=False
)

tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True
)


pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    device=-1
)

@app.get("/")
def root():
    return {"message": "MedAlpaca-7B model is ready."}

@app.post("/ask")
async def ask(request: Request):
    data = await request.json()
    text = data.get("text", "").strip()

    if not text:
        return {"error": "Missing 'text' in request body"}

    MAX_INPUT_CHARS = 800
    if len(text) > MAX_INPUT_CHARS:
        text = text[:MAX_INPUT_CHARS] + "..."


    result = pipe(
        text,
        max_new_tokens=30,
        do_sample=False,
        temperature=0.0,
        top_p=1.0,
    )

    output_text = result[0]["generated_text"].split("### Response:")[-1].strip()

    return {"output": output_text}
