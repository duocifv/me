#include <Arduino.h>
#include "config.h"
#include "WiFiService.h"
#include "SensorAir.h"
#include "SensorWater.h"
#include "CameraService.h"
#include "PumpControl.h"
#include "Uploader.h"

#define TEST_LOOP_INTERVAL_MS 5000  // 5 giây

enum TestState { PUMP_ON, PUMP_OFF };

WiFiService wifi(WIFI_SSID, WIFI_PASSWORD);
SensorAir air;
SensorWater water;
CameraService camera;
PumpControl pump;
Uploader uploader(SERVER_HOST, SERVER_PORT, DEVICE_TOKEN, DEVICE_ID);

unsigned long lastMillis = 0;
TestState pumpState = PUMP_OFF;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("=== 🚀 START FULL SYSTEM TEST MODE ===");

  Serial.printf("[INIT] Free heap: %u bytes\n", ESP.getFreeHeap());

  // Kết nối WiFi
  wifi.connect();
  if (wifi.isConnected()) {
    Serial.println("[✅ WiFi] Connected");
  } else {
    Serial.println("[❌ WiFi] FAILED to connect");
  }

  // Khởi tạo cảm biến và bơm
  air.setup();
  water.setup();
  pump.setup();
  Serial.println("[✅ INIT] Sensors and pump initialized");

  // Khởi tạo camera
  if (camera.setup()) {
    Serial.printf("[✅ Camera] Initialized. Heap: %u bytes\n", ESP.getFreeHeap());
  } else {
    Serial.println("[❌ Camera] Setup FAILED. Skipping camera usage.");
  }
}

void loop() {
  if (!wifi.isConnected()) {
    Serial.println("[⚠️ WiFi] Lost connection. Reconnecting...");
    wifi.connect();
    delay(500);
    return;
  }

  if (millis() - lastMillis >= TEST_LOOP_INTERVAL_MS) {
    lastMillis = millis();

    Serial.println("=== 🔄 SYSTEM LOOP START ===");

    // Điều khiển bơm ON/OFF luân phiên
    if (pumpState == PUMP_OFF) {
      pump.on();
      pumpState = PUMP_ON;
      Serial.println("[Pump] ✅ Turned ON");
    } else {
      pump.off();
      pumpState = PUMP_OFF;
      Serial.println("[Pump] ✅ Turned OFF");
    }

    // Đọc dữ liệu cảm biến
    float ambientTemp = NAN, humidity = NAN;
    air.read(ambientTemp, humidity);
    float waterTemp = water.readTemperature();

    Serial.printf("[Sensor] 🌡️ Ambient: %.2f°C, 💧 Humidity: %.2f%%, 🌊 Water: %.2f°C\n",
                  ambientTemp, humidity, waterTemp);

    // Gửi snapshot (sensor + ảnh)
    Serial.printf("[Uploader] 📤 Uploading snapshot (heap before: %u bytes)...\n", ESP.getFreeHeap());

    camera_fb_t* fb = camera.captureImage();
    const uint8_t* imgBuf = fb ? fb->buf : nullptr;
    size_t imgLen = fb ? fb->len : 0;

    bool uploadOK = uploader.sendSnapshot(ambientTemp, humidity, waterTemp, imgBuf, imgLen);

    if (fb) {
      Serial.printf("[Camera] ✅ Captured image (%u bytes)\n", fb->len);
      esp_camera_fb_return(fb);
    } else {
      Serial.println("[Camera] ❌ Failed to capture image");
    }

    Serial.printf("[Uploader] 📶 Upload status: %s\n", uploadOK ? "✅ SUCCESS" : "❌ FAILED");
    Serial.printf("[Memory] Heap after upload: %u bytes\n", ESP.getFreeHeap());
    Serial.println("=== ✅ SYSTEM LOOP END ===\n");
  }
}
