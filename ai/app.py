import os
import platform
import numpy as np
from PIL import Image
import tensorflow as tf
from flask import Flask, request, jsonify
import joblib
import logging
import time
import signal

# ⚙️ Giới hạn tài nguyên cho môi trường nhẹ
os.environ.update({
    "CUDA_VISIBLE_DEVICES": "-1",
    "OMP_NUM_THREADS": "1",
    "OPENBLAS_NUM_THREADS": "1",
    "MKL_NUM_THREADS": "1",
    "VECLIB_MAXIMUM_THREADS": "1",
    "NUMEXPR_NUM_THREADS": "1"
})
tf.config.threading.set_inter_op_parallelism_threads(1)
tf.config.threading.set_intra_op_parallelism_threads(1)

# 🧠 Giai đoạn phát triển cây trồng
CLASS_NAMES = ["Nảy mầm", "Ra lá mầm", "Phát triển thân lá", "Gần thu hoạch", "Thu hoạch"]
_input_details = None
_output_details = None

# Load mô hình ảnh (TFLite)
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()
_input_details = interpreter.get_input_details()
_output_details = interpreter.get_output_details()

# Load mô hình cảm biến
m_score = joblib.load("models/score_model.pkl")
m_fan = joblib.load("models/fan_model.pkl")
m_light = joblib.load("models/light_model.pkl")
m_pump = joblib.load("models/pump_model.pkl")
m_led = joblib.load("models/led_model.pkl")

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("log.txt"), logging.StreamHandler()]
)

app = Flask(__name__)
IS_WINDOWS = platform.system() == "Windows"

class TimeoutException(Exception): pass
if not IS_WINDOWS:
    signal.signal(signal.SIGALRM, lambda s, f: (_ for _ in ()).throw(TimeoutException("⏰ Quá thời gian xử lý.")))

# ————— IMAGE PREDICT —————
def predict_image(img_path):
    if not IS_WINDOWS:
        signal.alarm(15)
    try:
        img = Image.open(img_path).convert("RGB").resize((224, 224))
        arr = np.expand_dims(np.array(img, dtype=np.float32) / 255.0, axis=0)

        start = time.time()
        interpreter.set_tensor(_input_details[0]['index'], arr)
        interpreter.invoke()
        pred = interpreter.get_tensor(_output_details[0]['index'])[0]
        elapsed = time.time() - start
        logging.info(f"🧠 Image prediction in {elapsed:.2f}s")

        idx = int(np.argmax(pred))
        conf = round(float(pred[idx]) * 100, 2)

        ranges = ["0–7 ngày", "8–21 ngày", "22–40 ngày", "41–55 ngày", "56–65 ngày"]
        days = [8, 14, 19, 15, 0]
        timeline = []
        for i, label in enumerate(CLASS_NAMES):
            timeline.append({"label": label, "range": ranges[i], "current": (i == idx)})

        return {
            "stage": CLASS_NAMES[idx],
            "confidence": conf,
            "days_until_next": days[idx],
            "next_stage": CLASS_NAMES[idx + 1] if idx + 1 < len(CLASS_NAMES) else None,
            "estimated_days_to_harvest": sum(days[idx:]),
            "timeline": timeline
        }

    except TimeoutException as e:
        return {"error": str(e)}
    except Exception as e:
        logging.error("❌ predict_image error: %s", e)
        return {"error": "predict_image failed: " + str(e)}
    finally:
        if not IS_WINDOWS:
            signal.alarm(0)

# ————— SENSOR PREDICT —————
def predict_decision(data):
    try:
        features = ["waterTemp", "ambientTemp", "humidity", "ph", "ec", "orp"]
        X = np.array([[data.get(k, 0) for k in features]])

        return {
            "health_score": round(float(m_score.predict(X)[0]), 2),
            "turn_on_fan": bool(m_fan.predict(X)[0]),
            "adjust_light": round(float(m_light.predict(X)[0]), 2),
            "pump_duration": round(float(m_pump.predict(X)[0]), 2),
            "adjust_led": round(float(m_led.predict(X)[0]), 2)
        }
    except Exception as e:
        logging.error("❌ predict_decision error: %s", e)
        return {"error": "predict_decision failed: " + str(e)}

# ————— ROUTES —————
@app.route("/predict", methods=["POST"])
def route_predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    f = request.files['file']
    tmp = "temp"; os.makedirs(tmp, exist_ok=True)
    path = os.path.join(tmp, f.filename)
    f.save(path)

    res = predict_image(path)
    os.remove(path)
    return jsonify(res)

@app.route("/decision", methods=["POST"])
def route_decision():
    if not request.is_json:
        return jsonify({"error": "JSON required"}), 400

    d = request.get_json()

    # 1. Dự đoán giai đoạn sinh trưởng từ ảnh
    img = d.get("image_path")
    stage_info = {}
    if img and os.path.exists(img):
        stage_info = predict_image(img)
    else:
        stage_info = {"warning": "No valid image_path provided. Skipping growth stage prediction."}

    # 2. Dự đoán từ cảm biến môi trường
    env_info = predict_decision(d)

    # 3. Tổng hợp phản hồi
    response = {
        "📈 Health Evaluation": {
            "health_score": env_info.get("health_score")
        },
        "🌱 Growth Stage Estimation": {
            "stage": stage_info.get("stage"),
            "confidence": stage_info.get("confidence"),
            "days_until_next": stage_info.get("days_until_next"),
            "next_stage": stage_info.get("next_stage"),
            "estimated_days_to_harvest": stage_info.get("estimated_days_to_harvest"),
            "timeline": stage_info.get("timeline")
        },
        "⚡ Immediate Actions": {
            "turn_on_fan": env_info.get("turn_on_fan"),
            "adjust_light": env_info.get("adjust_light"),
            "adjust_led": env_info.get("adjust_led"),
            "pump_duration": env_info.get("pump_duration")
        },
        "📅 Auto Schedule": {
            "light_level": env_info.get("adjust_light"),
            "led_intensity": env_info.get("adjust_led"),
            "watering_time": env_info.get("pump_duration")
        }
    }

    return jsonify(response)

@app.route("/docs")
def route_docs():
    return """
    <h1>📘 API Sinh trưởng Cải Kale</h1>
    <ul>
      <li>POST /predict – Dự đoán giai đoạn từ ảnh (form-data: file=image)</li>
      <li>POST /decision – Kết hợp ảnh và cảm biến (JSON)</li>
    </ul>
    """

application = app

if __name__ == "__main__":
    app.run(debug=True)
