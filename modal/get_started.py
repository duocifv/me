import os
import re
import json
import modal
import requests
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TOKEN = os.getenv("TOKEN")

# Modal image
image = (
    modal.Image.debian_slim()
    .pip_install("requests", "python-dotenv")
    .env({
        "GEMINI_API_KEY": GEMINI_API_KEY,
        "TOKEN": TOKEN
    })
)

app = modal.App("ai-irrigation-suggestion", image=image)

# Endpoints
SCHEDULE_URL = "https://vegetable-container.onrender.com/v1/schedule/device-001"
CAMERA_URL = "https://vegetable-container.onrender.com/v1/mqtt/camera"
SENSOR_URL = "https://vegetable-container.onrender.com/v1/mqtt/sensors"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

@app.function()
def fetch_all():
    headers = {"Authorization": TOKEN, "accept": "*/*"}
    return {
        "schedule": requests.get(SCHEDULE_URL, headers=headers).json(),
        "camera": requests.get(CAMERA_URL, headers=headers).json(),
        "sensor": requests.get(SENSOR_URL, headers=headers).json(),
    }

@app.function()
def ask_gemini_irrigation(data):
    cam = data.get("camera")
    image_url = cam[-1]["url"] if isinstance(cam, list) and cam else cam.get("url", "")

    temp = data.get("sensor", {}).get("ambientTemperature")
    humidity = data.get("sensor", {}).get("humidity")

    prompt = f"""
Bạn là chuyên gia trồng rau muống.
Nhiệt độ hiện tại: {temp}°C, độ ẩm: {humidity}%.
Ảnh từ camera: {image_url}

Hãy đưa ra lịch bật/tắt pump, fan, led phù hợp trong ngày.

⚠️ Trả lời **chỉ là JSON thuần**, không chú thích, không markdown, không ```json.

Định dạng JSON:
{{
    "note": "Ghi chú ngắn gọn về lý do và logic tạo lịch.",
    "schedule": {{
  "pump": {{
    "times": [
      {{ "start": "06:00", "end": "06:10" }},
      {{ "start": "12:00", "end": "12:10" }}
    ]
  }},
  "fan": {{
    "times": [
      {{ "start": "08:00", "end": "08:10" }}
    ]
  }},
  "led": {{
    "times": []
  }}
   }}
}}

✅ Yêu cầu kỹ thuật:
- Trường `"note"` phải có, nội dung ngắn gọn giải thích cách AI tạo lịch.
- `"times"` là danh sách các khoảng thời gian có `start` và `end`, định dạng `"HH:MM"`.
- Nếu `"times"` rỗng, tức là thiết bị **không hoạt động** trong ngày.

🚫 Ràng buộc bắt buộc:
1. **Không bật nhiều thiết bị cùng lúc**. Mỗi thiết bị phải cách nhau ít nhất **10 phút**.
2. **Tối đa mỗi thiết bị được bật 3 lần/ngày**, mỗi lần **tối đa 15 phút**.
3. `pump` chỉ được bật vào sáng sớm (06:00–09:00) hoặc chiều mát (16:00–18:00).
4. `fan` chỉ nên hoạt động từ 09:00 đến 15:00.
5. `led` chỉ nên hoạt động vào sáng sớm hoặc chiều tối, không bật khi trời đã sáng đủ.
6. Lịch bật nên **rải đều trong ngày**, tránh dồn cùng lúc để **giảm tải hệ thống**.

Trả về JSON hợp lệ.
"""


    body = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
    }
    resp = requests.post(GEMINI_URL, headers=headers, json=body)
    resp.raise_for_status()
    return resp.json()

def extract_json(text: str):
    # Xóa phần ```json hoặc ```
    clean_text = re.sub(r"```(?:json)?", "", text).strip()
    try:
        first = clean_text.index("{")
        last = clean_text.rindex("}")
        json_str = clean_text[first:last+1]
        return json.loads(json_str)
    except Exception as e:
        print("❌ Không thể parse JSON:", e)
        print("🔎 Raw content:\n", clean_text)
        return None

@app.local_entrypoint()
def main():
    data = fetch_all.remote()
    print("📸 URL:", data['camera'][-1].get("url"))
    print("🌡️ Sensor:", data['sensor'])

    result = ask_gemini_irrigation.remote(data)
    raw_text = (
        result.get("candidates", [{}])[0]
        .get("content", {}).get("parts", [{}])[0]
        .get("text", "")
    )

    parsed = extract_json(raw_text)
    if not parsed:
        print("❌ Lỗi: không thể phân tích JSON từ phản hồi.")
        return

    def convert_times(device):
        if isinstance(device, dict) and "times" in device:
            return [
                {"start": t["start"], "end": t["end"]}
                for t in device["times"]
                if "start" in t and "end" in t
            ]
        return []

    schedule = parsed.get("schedule", {})
    note = parsed.get("note", "")

    final = [
        {"device": "pumpOn", "deviceId": "device-001", "times": convert_times(schedule.get("pump"))},
        {"device": "fanOn",  "deviceId": "device-001", "times": convert_times(schedule.get("fan"))},
        {"device": "ledOn",  "deviceId": "device-001", "times": convert_times(schedule.get("led"))},
    ]

    print("✅ Final API-like response:")
    print(json.dumps({
        "note": note,
        "schedule": final
    }, indent=2, ensure_ascii=False))
