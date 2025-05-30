#include <Arduino.h>
#include <TaskScheduler.h>
#include "config.h"
#include "WiFiService.h"
#include "SensorAir.h"
#include "SensorWater.h"
#include "PumpControl.h"
#include "Uploader.h"

// --- Cấu hình interval ---
#define LOOP_INTERVAL_MS 10000

// --- Khai báo services ---
WiFiService wifi(WIFI_SSID, WIFI_PASSWORD);
SensorAir    air;
SensorWater  water;
PumpControl  pump;
Uploader     uploader(SERVER_HOST, SERVER_PORT, DEVICE_TOKEN, DEVICE_ID);

// --- Scheduler ---
Scheduler runner;

// --- Task declarations ---
Task taskWiFi(0, TASK_FOREVER, []() {
  if (!wifi.isConnected()) {
    Serial.print("[WiFi] Connecting… ");
    wifi.begin();
    if (wifi.isConnected()) {
      Serial.println("OK");
    } else {
      Serial.println("FAIL → will retry");
    }
  }
});

Task taskSensor(LOOP_INTERVAL_MS, TASK_FOREVER, []() {
  float t = NAN, h = NAN, wt = NAN;
  if (air.read(t, h) && !isnan(t) && !isnan(h)) {
    Serial.printf("[SensorAir] T=%.2f°C H=%.2f%%\n", t, h);
  } else {
    Serial.println("[SensorAir] read FAIL");
  }

  wt = water.readTemperature();
  if (!isnan(wt)) {
    Serial.printf("[SensorWater] Temp=%.2f°C\n", wt);
  } else {
    Serial.println("[SensorWater] read FAIL");
  }
});

Task taskPump(LOOP_INTERVAL_MS, TASK_FOREVER, []() {
  static bool on = false;
  if (on) {
    pump.off();
    Serial.println("[Pump] OFF");
  } else {
    pump.on();
    Serial.println("[Pump] ON");
  }
  on = !on;
});

Task taskUpload(LOOP_INTERVAL_MS, TASK_FOREVER, []() {
  if (!wifi.isConnected()) {
    Serial.println("[Upload] No WiFi → skip");
    return;
  }

  float t = NAN, h = NAN, wt = NAN;
  air.read(t, h);
  wt = water.readTemperature();

  if (isnan(t) || isnan(h) || isnan(wt)) {
    Serial.println("[Upload] Invalid sensor data → skip");
    return;
  }

  bool ok = uploader.sendSensorData(t, h, wt);
  Serial.printf("[Upload] %s\n", ok ? "OK" : "FAIL");
});

// --- Setup ---
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("=== 🚀 SYSTEM START ===");

  air.setup();
  delay(200);
  water.setup();
  delay(200);
  pump.setup();
  delay(100);
  // uploader.begin(); // Nếu có, thêm ở đây

  runner.init();
  runner.addTask(taskWiFi);
  runner.addTask(taskSensor);
  runner.addTask(taskPump);
  runner.addTask(taskUpload);

  taskWiFi.enable();
  taskSensor.enableDelayed(LOOP_INTERVAL_MS);
  taskPump.enableDelayed(LOOP_INTERVAL_MS);
  taskUpload.enableDelayed(LOOP_INTERVAL_MS);
}

// --- Loop ---
void loop() {
  runner.execute();
}
