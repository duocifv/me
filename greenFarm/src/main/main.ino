#include <Arduino.h>
#include <TaskScheduler.h>

#include "wifi_module.h"
#include "http_sensors_module.h"
#include "dht_module.h"
#include "ds18b20_module.h"
#include "json_builder.h"
#include "relay_module.h"
#include "camera_module.h"
#include "http_camera_module.h"
#include "led_indicator.h"
#include "config.h"

// Modules
WifiModule wifi(ssid, password);
DHTModule dht;
DS18B20Module ds18b20;
RelayModule pumpRelay(12);
LedIndicator errorLed(4);
CameraModule cameraModule;
HttpSensorModule httpSensor(host, port, sensorPath, deviceToken, deviceId);
HttpCameraModule httpCamera(host, port, imgPath, deviceToken, deviceId);

char jsonBuffer[512];

// TaskScheduler
Scheduler ts;

// --- State ---
bool pumpIsOn = false;
float waterTemp = NAN, ambientTemp = NAN, humidity = NAN;
bool ds18b20Err = false, dhtErr = false;

// --- Task declarations ---
void readSensorsCallback();
void uploadDataCallback();
void uploadImageCallback();
void managePumpCallback();
void indicateError(bool dsErr, bool dhtErr);

Task tReadSensors(SENSOR_INTERVAL, TASK_FOREVER, &readSensorsCallback, &ts);
Task tUploadData(DATA_INTERVAL, TASK_FOREVER, &uploadDataCallback, &ts);
Task tUploadImage(IMAGE_INTERVAL, TASK_FOREVER, &uploadImageCallback, &ts);
Task tManagePump(PUMP_CYCLE_MS, TASK_FOREVER, &managePumpCallback, &ts);

void setup() {
  Serial.begin(115200);
  delay(1000);

  wifi.connect();
  dht.begin();
  ds18b20.begin();
  httpSensor.begin();
  cameraModule.init();
  httpCamera.setTimeout(20000);

  Serial.println("🚀 Setup hoàn tất");

  ts.addTask(tReadSensors);
  ts.addTask(tUploadData);
  ts.addTask(tUploadImage);
  ts.addTask(tManagePump);

  tReadSensors.enable();
  tUploadData.enable();
  tUploadImage.enable();
  tManagePump.enable();
}

void loop() {
  if (!wifi.isConnected()) {
    Serial.println("⚠️ WiFi mất kết nối, đang thử lại...");
    errorLed.blink(1, 300);
    wifi.connect();
  }
  ts.execute();
}

// ---------- TASK FUNCTIONS ----------

void readSensorsCallback() {
  dht.update();
  waterTemp   = ds18b20.getTemperature();
  ambientTemp = dht.getTemperature();
  humidity    = dht.getHumidity();

  ds18b20Err = isnan(waterTemp);
  dhtErr     = isnan(ambientTemp) || isnan(humidity);

  indicateError(ds18b20Err, dhtErr);

  Serial.printf("🌊 Water Temp: %s°C\n", ds18b20Err ? "--" : String(waterTemp, 1).c_str());
  Serial.printf("🌡 Ambient Temp: %s°C\n", dhtErr ? "--" : String(ambientTemp, 1).c_str());
  Serial.printf("💧 Humidity: %s%%\n", dhtErr ? "--" : String(humidity, 1).c_str());
}

void uploadDataCallback() {
  float ph  = 7.0;
  float ec  = 1.5;
  int orp   = 400;

  size_t jsonLen = buildJsonSnapshots(
    jsonBuffer, sizeof(jsonBuffer),
    waterTemp, ambientTemp, humidity,
    ph, ec, orp
  );

  if (jsonLen > 0) {
    if (httpSensor.sendData(jsonBuffer, jsonLen)) {
      Serial.println("✅ Gửi dữ liệu API thành công");
    } else {
      Serial.println("❌ Gửi dữ liệu API thất bại");
    }
  } else {
    Serial.println("❌ Tạo JSON payload thất bại");
  }
}

void uploadImageCallback() {
  if (!wifi.isConnected()) {
    Serial.println("⚠️ Bỏ qua gửi ảnh vì mất WiFi");
    return;
  }

  camera_fb_t* fb = cameraModule.capture();
  if (fb) {
    unsigned long duration;
    if (httpCamera.send(fb, duration)) {
      Serial.printf("✅ Gửi ảnh OK, mất %lums\n", duration);
    } else {
      Serial.println("❌ Gửi ảnh thất bại");
    }
    cameraModule.release(fb);
  } else {
    Serial.println("❌ Không lấy được frame để gửi");
  }
}

void managePumpCallback() {
  if (!pumpIsOn) {
    pumpRelay.turnOn();
    pumpIsOn = true;
    Serial.println("💧 Bơm ON");
    tManagePump.setInterval(PUMP_ON_MS);
  } else {
    pumpRelay.turnOff();
    pumpIsOn = false;
    Serial.println("💧 Bơm OFF");
    tManagePump.setInterval(PUMP_CYCLE_MS);
  }
}

void indicateError(bool dsErr, bool dhtErr) {
  if (dsErr) {
    errorLed.blink(3, 200);
  } else if (dhtErr) {
    errorLed.blink(2, 200);
  } else {
    errorLed.off();
  }
}
