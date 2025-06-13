import os
import uvicorn
import shutil
import requests

import numpy as np
import cv2
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional

# === Cấu hình ===
IMAGE_SIZE = (224, 224)
MODEL_URL = "https://crop.duocnv.top/kale_growth_model.h5"
MODEL_PATH = "kale_growth_model.h5"
TEMP_DIR = "temp"

# === Tắt GPU (nếu cần) ===
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# === Tải model nếu chưa có ===
if not os.path.exists(MODEL_PATH):
    print("⏬ Downloading model...")
    r = requests.get(MODEL_URL, stream=True)
    with open(MODEL_PATH, 'wb') as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    print("✅ Model downloaded.")

# === Load mô hình và class names ===
model = tf.keras.models.load_model(MODEL_PATH)
class_names = [
    "Nảy mầm", "Ra lá mầm", "Phát triển thân lá",
    "Gần thu hoạch", "Thu hoạch"
]

# === Định nghĩa Pydantic models ===
class TimelineItem(BaseModel):
    label: str
    range: str
    current: bool

class PredictionResult(BaseModel):
    stage: str
    confidence: float
    days_until_next: int
    next_stage: Optional[str]
    estimated_days_to_harvest: int
    timeline: List[TimelineItem]

# === FastAPI app ===
app = FastAPI(
    title="Kale Growth Stage Predictor",
    description="Dự đoán giai đoạn sinh trưởng của cải kale từ ảnh.",
    version="1.0.0"
)


def predict_image(image_path: str) -> PredictionResult:
    # Đọc và tiền xử lý ảnh
    img = cv2.imread(image_path)
    img = cv2.resize(img, IMAGE_SIZE)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=0)

    # Dự đoán
    pred = model.predict(img)[0]
    top = int(np.argmax(pred))
    confidence = round(float(pred[top]) * 100, 2)
    stage = class_names[top]

    # Timeline giai đoạn
    timeline = [
        {"label": "Nảy mầm",            "range": "0–7 ngày",    "current": False},
        {"label": "Ra lá mầm",          "range": "8–21 ngày",  "current": False},
        {"label": "Phát triển thân lá",  "range": "22–40 ngày", "current": False},
        {"label": "Gần thu hoạch",       "range": "41–55 ngày", "current": False},
        {"label": "Thu hoạch",           "range": "56–65 ngày", "current": False},
    ]
    timeline[top]["current"] = True

    # Tính days_until_next và estimated_days_to_harvest
    days_spans = [8, 14, 19, 15, 10]
    days_until_next = days_spans[top] if top < len(days_spans) - 1 else 0
    estimated_days_to_harvest = sum(days_spans[top:])
    next_stage = class_names[top + 1] if top < len(class_names) - 1 else None

    return PredictionResult(
        stage=stage,
        confidence=confidence,
        days_until_next=days_until_next,
        next_stage=next_stage,
        estimated_days_to_harvest=estimated_days_to_harvest,
        timeline=[TimelineItem(**item) for item in timeline]
    )


@app.post(
    "/predict", 
    response_model=PredictionResult,
    summary="Predict kale growth stage",
    description="Upload an image and get back the predicted growth stage with timeline.",
    status_code=200
)
async def predict_endpoint(file: UploadFile = File(...)) -> PredictionResult:
    # Tạo thư mục temp nếu chưa có
    os.makedirs(TEMP_DIR, exist_ok=True)
    file_path = os.path.join(TEMP_DIR, file.filename)

    # Lưu file tạm
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Dự đoán
    result = predict_image(file_path)

    # Xóa file tạm
    os.remove(file_path)
    return result



# Nếu chạy trực tiếp
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
