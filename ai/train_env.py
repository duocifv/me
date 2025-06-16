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

X = df[["waterTemp", "ambientTemp", "humidity", "ph", "ec", "orp"]]

# Mục tiêu đầu ra
y_score = df["health_score"]
y_fan = df["turn_on_fan"].astype(int)
y_light = df["adjust_light"]
y_pump = df["pump_duration"]
y_led = df["adjust_led"]

# Tách tập huấn luyện và kiểm tra
X_train, X_test, y_score_train, y_score_test, y_fan_train, y_fan_test, y_light_train, y_light_test, y_pump_train, y_pump_test, y_led_train, y_led_test = train_test_split(
    X, y_score, y_fan, y_light, y_pump, y_led, test_size=0.2, random_state=42
)

# Huấn luyện từng mô hình riêng biệt
m_score = RandomForestRegressor().fit(X_train, y_score_train)
m_fan = RandomForestClassifier().fit(X_train, y_fan_train)
m_light = RandomForestRegressor().fit(X_train, y_light_train)
m_pump = RandomForestRegressor().fit(X_train, y_pump_train)
m_led = RandomForestRegressor().fit(X_train, y_led_train)

# Lưu mô hình
joblib.dump(m_score, "models/score_model.pkl")
joblib.dump(m_fan, "models/fan_model.pkl")
joblib.dump(m_light, "models/light_model.pkl")
joblib.dump(m_pump, "models/pump_model.pkl")
joblib.dump(m_led, "models/led_model.pkl")

print("✅ Các mô hình đã huấn luyện và lưu thành công.")
