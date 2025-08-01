from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

app = FastAPI()

# Dữ liệu cảm biến
class SensorData(BaseModel):
    id: int
    waterTemperature: float
    ambientTemperature: float
    humidity: float
    createdAt: datetime

# Dữ liệu đầu vào tổng hợp
class ScheduleInput(BaseModel):
    image: HttpUrl  # hoặc đổi thành base64 string nếu cần
    sensors: SensorData
    history: Optional[str] = None

# Route test đơn giản
@app.get("/")
def read_root():
    return {"status": "ready"}

# Route chính xử lý AI gợi ý lịch hoạt động
@app.post("/suggest")
def suggest_schedule(data: ScheduleInput):
    # Gỉa lập xử lý với AI / rule
    temp = data.sensors.ambientTemperature
    humidity = data.sensors.humidity

    suggestions = []

    if temp > 30:
        suggestions.append("Bật quạt lúc 9h sáng")
    if data.sensors.waterTemperature > 27:
        suggestions.append("Chạy bơm lúc 7h30")
    if humidity > 65:
        suggestions.append("Không cần tưới thêm")

    # Kết quả mẫu
    return {
        "image_used": data.image,
        "analysis_time": data.sensors.createdAt,
        "suggestions": suggestions,
        "note": "Đề xuất dựa trên ảnh và cảm biến, có thể tinh chỉnh bằng GPT sau."
    }
