#include <Arduino.h>
#include "config.h"
#include "WiFiService.h"
#include "SensorAir.h"
#include "SensorWater.h"
// #include "CameraService.h"  // Tạm thời tắt camera
#include "PumpControl.h"
#include "Uploader.h"

#define TEST_LOOP_INTERVAL_MS 10000  // 10 giây để tránh spam

enum TestState { PUMP_ON, PUMP_OFF };

WiFiService wifi(WIFI_SSID, WIFI_PASSWORD);
SensorAir air;
SensorWater water;
// CameraService camera;  // Không sử dụng
PumpControl pump;
Uploader uploader(SERVER_HOST, SERVER_PORT, DEVICE_TOKEN, DEVICE_ID);

unsigned long lastMillis = 0;
TestState pumpState = PUMP_OFF;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("=== 🚀 START SYSTEM ===");

  Serial.printf("[INIT] Free heap: %u bytes\n", ESP.getFreeHeap());

  // Kết nối WiFi
  wifi.connect();
  if (wifi.isConnected()) {
    Serial.println("[✅ WiFi] Connected");
  } else {
    Serial.println("[❌ WiFi] FAILED to connect");
  }

  air.setup();
  water.setup();
  pump.setup();
  Serial.println("[✅ INIT] Sensors and pump initialized");

  Serial.println("[ℹ️ Camera] Skipped (disabled)");
}

void loop() {
  static int wifiRetry = 0;

  if (!wifi.isConnected()) {
    if (wifiRetry < 3) {
      Serial.printf("[⚠️ WiFi] Disconnected. Attempting reconnect (%d)...\n", wifiRetry + 1);
      wifi.connect();
      wifiRetry++;
    } else {
      Serial.println("[❌ WiFi] Too many failures. Skipping this cycle.");
      delay(TEST_LOOP_INTERVAL_MS);
      return;
    }
  } else {
    wifiRetry = 0;  // reset if connected
  }

  if (millis() - lastMillis >= TEST_LOOP_INTERVAL_MS) {
    lastMillis = millis();
    Serial.println("=== 🔁 SYSTEM LOOP ===");

    // Pump control
    if (pumpState == PUMP_OFF) {
      pump.on();
      pumpState = PUMP_ON;
      Serial.println("[Pump] ✅ Turned ON");
    } else {
      pump.off();
      pumpState = PUMP_OFF;
      Serial.println("[Pump] ✅ Turned OFF");
    }

    // Sensor read
    float ambientTemp = NAN, humidity = NAN;
    air.read(ambientTemp, humidity);
    float waterTemp = water.readTemperature();

    Serial.printf("[Sensor] 🌡️ %.2f°C | 💧 %.2f%% | 🌊 %.2f°C\n",
                  ambientTemp, humidity, waterTemp);

    bool ok = uploader.sendSensorData(ambientTemp, humidity, waterTemp);
    Serial.printf("[Uploader] 📶 Status: %s\n", ok ? "✅ SUCCESS" : "❌ FAILED");
    Serial.println("=== ✅ LOOP DONE ===\n");
  }
}
