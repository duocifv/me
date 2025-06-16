import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
import os

# Đảm bảo thư mục models tồn tại
os.makedirs("models", exist_ok=True)

# Load dữ liệu
df = pd.read_csv("dataenv/env_data.csv")

print("👀 Trước khi dropna:", df.shape)
df = df.dropna()
print("✅ Sau khi dropna:", df.shape)

# Đặc trưng đầu vào
X = df[["waterTemp", "ambientTemp", "humidity", "ph", "ec", "orp"]]

# Mục tiêu
y_health = df["health_score"]  # Đánh giá sức khỏe
y_stage = df["growth_stage"]   # Dự đoán giai đoạn sinh trưởng (giả định cột đã tồn tại)

# Khuyến nghị hành động tức thì
y_fan = df["turn_on_fan"].astype(int)
y_light = df["adjust_light"]
y_pump = df["pump_duration"]
y_led = df["adjust_led"]

# Tách tập train/test
X_train, X_test, y_health_train, y_health_test, y_stage_train, y_stage_test, y_fan_train, y_fan_test, y_light_train, y_light_test, y_pump_train, y_pump_test, y_led_train, y_led_test = train_test_split(
    X, y_health, y_stage, y_fan, y_light, y_pump, y_led, test_size=0.2, random_state=42
)

# Huấn luyện mô hình
m_health = RandomForestRegressor().fit(X_train, y_health_train)
m_stage = RandomForestClassifier().fit(X_train, y_stage_train)
m_fan = RandomForestClassifier().fit(X_train, y_fan_train)
m_light = RandomForestRegressor().fit(X_train, y_light_train)
m_pump = RandomForestRegressor().fit(X_train, y_pump_train)
m_led = RandomForestRegressor().fit(X_train, y_led_train)

# Lưu mô hình
joblib.dump(m_health, "models/health_model.pkl")
joblib.dump(m_stage, "models/stage_model.pkl")
joblib.dump(m_fan, "models/fan_model.pkl")
joblib.dump(m_light, "models/light_model.pkl")
joblib.dump(m_pump, "models/pump_model.pkl")
joblib.dump(m_led, "models/led_model.pkl")

print("✅ Các mô hình đã được huấn luyện và lưu thành công:")
print("📈 - Health Score")
print("🌱 - Growth Stage")
print("⚡ - Hành động tức thì (quạt, đèn, bơm)")
print("📅 - Lịch hoạt động tối ưu")
