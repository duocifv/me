import os
import requests

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse

import tensorflow as tf
import numpy as np
import cv2
import shutil

MODEL_URL = "https://crop.duocnv.top/kale_growth_model.h5"
MODEL_PATH = "kale_growth_model.h5"

# Tải mô hình nếu chưa tồn tại
if not os.path.exists(MODEL_PATH):
    print("⏬ Downloading model...")
    r = requests.get(MODEL_URL)
    with open(MODEL_PATH, 'wb') as f:
        f.write(r.content)
    print("✅ Model downloaded.")

# Tắt dùng GPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# Tải model
model = tf.keras.models.load_model(MODEL_PATH)
class_names = ["Nảy mầm", "Ra lá mầm", "Phát triển thân lá", "Gần thu hoạch", "Thu hoạch"]

app = FastAPI()

def predict_image(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (224, 224))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=0)

    pred = model.predict(img)[0]
    top = np.argmax(pred)
    confidence = round(float(pred[top]) * 100, 2)
    stage = class_names[top]

    timeline = [
        {"label": "Nảy mầm", "range": "0–7 ngày"},
        {"label": "Ra lá mầm", "range": "8–21 ngày"},
        {"label": "Phát triển thân lá", "range": "22–40 ngày"},
        {"label": "Gần thu hoạch", "range": "41–55 ngày"},
        {"label": "Thu hoạch", "range": "56–65 ngày"},
    ]
    for i, t in enumerate(timeline):
        t["current"] = (i == top)

    next_stage = timeline[top + 1]["label"] if top + 1 < len(timeline) else None
    days_until_next = [8, 14, 19, 15, 0][top] if top < len(timeline) else 0
    estimated_days_to_harvest = sum([8, 14, 19, 15, 10]) - sum([8, 14, 19, 15, 10][:top])

    return {
        "stage": stage,
        "confidence": confidence,
        "days_until_next": days_until_next,
        "next_stage": next_stage,
        "estimated_days_to_harvest": estimated_days_to_harvest,
        "timeline": timeline,
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    os.makedirs("temp", exist_ok=True)
    file_path = os.path.join("temp", file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = predict_image(file_path)
    os.remove(file_path)
    return JSONResponse(content=result)
