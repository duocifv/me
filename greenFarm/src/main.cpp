#include <Arduino.h>
#include <WiFi.h>

#include "config.h"
#include "PumpControl.h"
#include "SensorAir.h"
#include "SensorWater.h"
#include "CameraService.h"
#include "WiFiService.h"
#include "Uploader.h"

// --- Cấu hình thời gian (ms) ---
constexpr unsigned long SENSOR_INTERVAL_MS = 5000;
constexpr unsigned long IMAGE_INTERVAL_MS = 30000;
constexpr unsigned long WIFI_CHECK_MS = 10000;

// --- Khởi tạo module ---
PumpControl pump;
SensorAir airSensor;
SensorWater waterSensor;
CameraService camera;
WiFiService wifi(WIFI_SSID, WIFI_PASSWORD);
Uploader uploader(DEVICE_TOKEN, DEVICE_ID);

// --- Biến theo dõi thời gian ---
unsigned long lastSensorTime = 0;
unsigned long lastImageTime = 0;
unsigned long lastWiFiCheck = 0;

// Đảm bảo kết nối WiFi, tự reconnect nếu mất
void ensureWiFi()
{
  if (WiFi.status() != WL_CONNECTED && millis() - lastWiFiCheck >= WIFI_CHECK_MS)
  {
    lastWiFiCheck = millis();
    Serial.println(F("⚠️ WiFi mất kết nối, thử lại..."));
    wifi.connect();
  }
}

// Task đọc & gửi dữ liệu cảm biến
void handleSensorTask()
{
  float airTemp = 0.0f, airHumid = 0.0f;
  airSensor.read(airTemp, airHumid);
  float waterTemp = waterSensor.readTemperature();

  Serial.printf(
      "[Dữ liệu] Air: %.2f°C | Hum: %.2f%% | Water: %.2f°C\n",
      airTemp, airHumid, waterTemp);

  if (airHumid < 60.0f || waterTemp > 30.0f)
  {
    pump.on();
  }
  else
  {
    pump.off();
  }

  uploader.sendSensorData(waterTemp, airTemp, airHumid);
}

// Task chụp & gửi ảnh
void handleImageTask()
{
  camera.captureImage();
  uploader.sendImage("/logo.png");
}

void setup()
{
  Serial.begin(115200);
  delay(500);

  // Kết nối WiFi
  wifi.connect();

  // Khởi tạo phần cứng và service
  pump.setup();
  airSensor.setup();
  waterSensor.setup();
  camera.setup();

  // Gửi gói dữ liệu khởi động (tuỳ chọn)
  uploader.sendSensorData(0.0f, 0.0f, 0.0f);
}

void loop()
{
  unsigned long now = millis();

  ensureWiFi();

  if (now - lastSensorTime >= SENSOR_INTERVAL_MS)
  {
    lastSensorTime = now;
    handleSensorTask();
  }

  if (now - lastImageTime >= IMAGE_INTERVAL_MS)
  {
    lastImageTime = now;
    handleImageTask();
  }

  // Loop không delay để có thể mở rộng thêm task khác
}
