from flask import Flask, request, jsonify
import os
import urllib.request
import tensorflow as tf
import numpy as np
import cv2

# Tắt dùng GPU (vì thường server Render không hỗ trợ)
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

app = Flask(__name__)

MODEL_PATH = "kale_growth_model.h5"
MODEL_URL = "https://crop.duocnv.top/kale_growth_model.h5"

# Tự động tải model nếu chưa có
if not os.path.exists(MODEL_PATH):
    print("⬇️ Đang tải mô hình...")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print("✅ Đã tải xong mô hình.")

# Load mô hình
model = tf.keras.models.load_model(MODEL_PATH)

# Tên các giai đoạn sinh trưởng
class_names = ["Nảy mầm", "Ra lá mầm", "Phát triển thân lá", "Gần thu hoạch", "Thu hoạch"]

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
    estimated_days_to_harvest = max(0, sum([8, 14, 19, 15, 10]) - sum([8, 14, 19, 15, 10][:top]))

    return {
        "stage": stage,
        "confidence": confidence,
        "days_until_next": days_until_next,
        "next_stage": next_stage,
        "estimated_days_to_harvest": estimated_days_to_harvest,
        "timeline": timeline,
    }

@app.route("/predict", methods=["POST"])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    os.makedirs("temp", exist_ok=True)
    file_path = os.path.join("temp", file.filename)
    file.save(file_path)

    try:
        result = predict_image(file_path)
    finally:
        os.remove(file_path)

    return jsonify(result)

# WSGI entry point
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
