from flask import Flask, request, jsonify

import os

# ⚙️ Giới hạn tài nguyên để tránh lỗi trên shared hosting
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import tensorflow as tf
import numpy as np
import cv2

# ✅ Giới hạn số lượng luồng sử dụng trong TensorFlow
tf.config.threading.set_inter_op_parallelism_threads(1)
tf.config.threading.set_intra_op_parallelism_threads(1)

app = Flask(__name__)

# 📦 Load model
model = tf.keras.models.load_model("kale_growth_model.h5")
class_names = ["Nảy mầm", "Ra lá mầm", "Phát triển thân lá", "Gần thu hoạch", "Thu hoạch"]

# 🧠 Predict function
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

    # 📅 Timeline thông tin sinh trưởng
    timeline = [
        {"label": "Nảy mầm", "range": "0–7 ngày"},
        {"label": "Ra lá mầm", "range": "8–21 ngày"},
        {"label": "Phát triển thân lá", "range": "22–40 ngày"},
        {"label": "Gần thu hoạch", "range": "41–55 ngày"},
        {"label": "Thu hoạch", "range": "56–65 ngày"},
    ]

    current_index = top
    for i, t in enumerate(timeline):
        t["current"] = (i == current_index)

    next_stage = timeline[current_index + 1]["label"] if current_index + 1 < len(timeline) else None
    days_until_next = [8, 14, 19, 15, 0][current_index]
    estimated_days_to_harvest = sum([8, 14, 19, 15, 10]) - sum([8, 14, 19, 15, 10][:current_index])

    return {
        "stage": stage,
        "confidence": confidence,
        "days_until_next": days_until_next,
        "next_stage": next_stage,
        "estimated_days_to_harvest": estimated_days_to_harvest,
        "timeline": timeline,
    }

# 📥 API endpoint
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
    except Exception as e:
        result = {"error": str(e)}
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    return jsonify(result)

# 📄 Docs endpoint
@app.route("/docs", methods=["GET"])
def docs():
    return """
    <h1>📘 Hướng dẫn sử dụng API</h1>
    <p>Gửi hình ảnh cây cải Kale để dự đoán giai đoạn sinh trưởng.</p>
    <h3>📤 Endpoint:</h3>
    <pre>POST /predict</pre>
    <h3>🔽 Tham số:</h3>
    <ul>
        <li><code>file</code>: Hình ảnh dạng JPEG/PNG</li>
    </ul>
    <h3>💡 Ví dụ dùng curl:</h3>
    <pre>
curl -X POST -F "file=@your_image.jpg" https://crop.duocnv.top/predict
    </pre>
    <p>Trả về JSON với thông tin giai đoạn, độ tin cậy và số ngày còn lại.</p>
    """

# 🔥 WSGI entry point
application = app