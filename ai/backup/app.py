import os
import numpy as np
from PIL import Image
import tensorflow as tf
from flask import Flask, request, jsonify
import logging
import time
import signal

# ⚙️ Giới hạn tài nguyên
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

# 📘 Tên lớp
class_names = ["Nảy mầm", "Ra lá mầm", "Phát triển thân lá", "Gần thu hoạch", "Thu hoạch"]

# 📦 Load mô hình TFLite
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# 📝 Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("log.txt"),
        logging.StreamHandler()
    ]
)

app = Flask(__name__)

# ⏰ Giới hạn thời gian xử lý
class TimeoutException(Exception): pass
signal.signal(signal.SIGALRM, lambda s, f: (_ for _ in ()).throw(TimeoutException("⏰ Quá thời gian xử lý.")))

# 🔮 Hàm dự đoán
def predict_image(img_path):
    signal.alarm(15)
    try:
        img = Image.open(img_path).convert("RGB").resize((224, 224))
        img = np.expand_dims(np.array(img, dtype=np.float32) / 255.0, axis=0)

        start = time.time()
        interpreter.set_tensor(input_details[0]['index'], img)
        interpreter.invoke()
        pred = interpreter.get_tensor(output_details[0]['index'])[0]
        elapsed = time.time() - start
        logging.info(f"🧠 Dự đoán xong sau {elapsed:.2f} giây.")

        top = int(np.argmax(pred))
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
        days = [8, 14, 19, 15, 0]
        days_until_next = days[top]
        estimated_days_to_harvest = sum(days[top:])

        return {
            "stage": stage,
            "confidence": confidence,
            "days_until_next": days_until_next,
            "next_stage": next_stage,
            "estimated_days_to_harvest": estimated_days_to_harvest,
            "timeline": timeline,
        }

    except TimeoutException as e:
        logging.warning(str(e))
        return {"error": str(e)}
    except Exception as e:
        logging.error("❌ Lỗi xử lý ảnh: " + str(e))
        return {"error": "Không thể xử lý ảnh: " + str(e)}
    finally:
        signal.alarm(0)

# 📥 POST /predict
@app.route("/predict", methods=["POST"])
def predict():
    if 'file' not in request.files:
        logging.warning("⚠️ Không có file.")
        return jsonify({"error": "Không có ảnh nào được gửi."}), 400

    file = request.files['file']
    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)
    path = os.path.join(temp_dir, file.filename)
    file.save(path)
    logging.info(f"📥 Ảnh lưu tại: {path}")

    try:
        result = predict_image(path)
    finally:
        if os.path.exists(path):
            os.remove(path)
            logging.info(f"🧹 Xoá file: {path}")

    return jsonify(result)

# 📘 GET /docs
@app.route("/docs")
def docs():
    return """
    <h1>📘 API Sinh trưởng Cải Kale</h1>
    <p>Dự đoán giai đoạn phát triển từ ảnh chụp cây.</p>
    <b>POST /predict</b><br>
    <ul><li>file: ảnh JPEG hoặc PNG</li></ul>
    <pre>curl -X POST -F "file=@image.jpg" https://crop.duocnv.top/predict</pre>
    """

# 🧪 Entrypoint cho WSGI
application = app

if __name__ == "__main__":
    app.run(debug=True)
