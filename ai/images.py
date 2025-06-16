import os
import platform
import numpy as np
from PIL import Image
import tensorflow as tf
from flask import Flask, request, jsonify
import joblib
import logging
import signal
from datetime import datetime

# -------------------- Giới hạn tài nguyên --------------------
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

# -------------------- Logging --------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("log.txt"), logging.StreamHandler()]
)

# -------------------- Flask App --------------------
app = Flask(__name__)
IS_WINDOWS = platform.system() == "Windows"

# -------------------- Timeout --------------------
class TimeoutException(Exception): pass
if not IS_WINDOWS:
    signal.signal(signal.SIGALRM, lambda s, f: (_ for _ in ()).throw(TimeoutException("⏰ Quá thời gian xử lý.")))

# -------------------- Load Image Model --------------------
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()
_input_details = interpreter.get_input_details()
_output_details = interpreter.get_output_details()

def predict_image(img_path):
    if not IS_WINDOWS:
        signal.alarm(15)
    try:
        img = Image.open(img_path).convert("RGB").resize((224, 224))
        arr = np.expand_dims(np.array(img, dtype=np.float32) / 255.0, axis=0)
        interpreter.set_tensor(_input_details[0]['index'], arr)
        interpreter.invoke()
        pred = interpreter.get_tensor(_output_details[0]['index'])[0]
        idx = int(np.argmax(pred))
        conf = round(float(pred[idx]) * 100, 2)
        CLASS_NAMES = ["Nảy mầm","Ra lá mầm","Phát triển thân lá","Gần thu hoạch","Thu hoạch"]
        ranges = ["0–7 ngày","8–21 ngày","22–40 ngày","41–55 ngày","56–65 ngày"]
        days = [8,14,19,15,0]
        timeline = [{"label": CLASS_NAMES[i], "range": ranges[i], "current": i==idx} for i in range(len(CLASS_NAMES))]
        return {
            "stage": CLASS_NAMES[idx],
            "confidence": conf,
            "days_until_next": days[idx],
            "next_stage": CLASS_NAMES[idx+1] if idx+1<len(CLASS_NAMES) else None,
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

# -------------------- Load Sensor Models --------------------
models_dir = "models"
m_score = joblib.load(os.path.join(models_dir, "score_model.pkl"))
m_fan   = joblib.load(os.path.join(models_dir, "fan_model.pkl"))
m_light = joblib.load(os.path.join(models_dir, "light_model.pkl"))
m_pump  = joblib.load(os.path.join(models_dir, "pump_model.pkl"))
m_led   = joblib.load(os.path.join(models_dir, "led_model.pkl"))

# -------------------- Optimal thresholds --------------------
optimal_env = {"ph":(6.0,7.0), "ec":(1.0,2.0), "orp":(300,450)}

# -------------------- Helper Functions --------------------
def calculate_health_score(data):
    score = 100
    details = {}
    for k,(lo,hi) in optimal_env.items():
        val = data.get(k,0)
        if val<lo:
            status="quá thấp"; score-=15
        elif val>hi:
            status="quá cao"; score-=15
        else:
            status="ổn định"
        details[k] = {"value":val, "status":status}
    return max(score,0), details

# reuse existing predict_environment for growth stage
from app_helpers import predict_environment

# -------------------- ROUTES --------------------
@app.route("/predict", methods=["POST"])
def route_predict():
    if 'file' not in request.files:
        return jsonify({"error":"No file uploaded"}),400
    f = request.files['file']
    tmp = "temp"; os.makedirs(tmp, exist_ok=True)
    path = os.path.join(tmp, f.filename)
    f.save(path)
    res = predict_image(path)
    os.remove(path)
    return jsonify(res)

@app.route("/ai-decision", methods=["POST"])
def ai_decision():
    d = request.get_json(force=True)
    if not d:
        return jsonify({"error":"JSON required"}),400
    # 1) Health
    score, details = calculate_health_score(d)
    # 2) Stage
    env = predict_environment(d)
    # 3) Recommendations
    recs=[]
    ph=d.get('ph',0)
    if ph<optimal_env['ph'][0]: recs.append("⚠️ pH thấp: cân nhắc bón vôi")
    if ph>optimal_env['ph'][1]: recs.append("⚠️ pH cao: pha thêm acid citric")
    ec=d.get('ec',0)
    if ec<optimal_env['ec'][0]: recs.append("⚠️ EC thấp: tăng dinh dưỡng")
    orp=d.get('orp',0)
    if orp<optimal_env['orp'][0]: recs.append("⚠️ ORP thấp: kiểm tra oxy hóa")
    at=d.get('ambientTemp',0)
    if at>30: recs.append("⚠️ Nhiệt độ cao: tăng tần suất quạt")
    # 4) Optimized schedule
    base={'led': ["06:00-06:30","10:00-10:30","14:00-14:30","18:00-18:30"],
          'fan': ["06:45-07:00","12:00-12:15","18:00-18:15"],
          'pump':["06:05","15:05","19:05"]}
    if at>30: base['fan'].append("21:00-21:15")
    return jsonify({
        'health': {'score':score,'details':details},
        'growth_stage': {'stage':env.get('stage'),'confidence':env.get('confidence')},
        'recommendations':recs,
        'optimized_schedule':base
    })

if __name__=="__main__":
    app.run(debug=True)