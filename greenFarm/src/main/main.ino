#include <Arduino.h>
#include <TaskScheduler.h>

#include "config.h"
#include "wifi_module.h"
#include "http_sensors_module.h"
#include "dht_module.h"
#include "ds18b20_module.h"
#include "json_builder.h"
#include "relay_module.h"
#include "camera_module.h"
#include "http_camera_module.h"
#include "led_indicator.h"

// ----- Các mô-đun -----
WifiModule     wifi(ssid, password);
DHTModule      dht;
DS18B20Module  ds18b20;
RelayModule    pumpRelay(12, false);   // activeLow=false (board relay COM–NO cần HIGH để ON)
LedIndicator   errorLed(4);
CameraModule   cameraModule;
HttpSensorModule httpSensor(host, port, sensorPath, deviceToken, deviceId);
HttpCameraModule httpCamera(host, port, imgPath, deviceToken, deviceId);

char jsonBuffer[512];

// ----- TaskScheduler -----
Scheduler ts;

// ----- Trạng thái chung -----
bool pumpIsOn    = false;
float waterTemp  = NAN, ambientTemp = NAN, humidity = NAN;
bool ds18b20Err  = false, dhtErr     = false;
bool wifiErr     = false;

// ----- Khai báo callback cho TaskScheduler -----
void readSensorsCallback();
void uploadDataCallback();
void uploadImageCallback();
void managePumpCallback();
void indicateError(bool wifiErr, bool dsErr, bool dhtErr);

// Tạo các Task, chỉ định khoảng interval
Task tReadSensors(  SENSOR_INTERVAL, TASK_FOREVER, &readSensorsCallback, &ts);
Task tUploadData(   DATA_INTERVAL,   TASK_FOREVER, &uploadDataCallback, &ts);
Task tUploadImage(  IMAGE_INTERVAL,  TASK_FOREVER, &uploadImageCallback, &ts);
Task tManagePump(   PUMP_CYCLE_MS,   TASK_FOREVER, &managePumpCallback, &ts);

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n===== Bắt đầu setup() =====");

  // 1) Kết nối WiFi lần đầu
  wifi.connect();
  Serial.println("[Setup] Đã gọi wifi.connect()");

  // 2) Khởi động cảm biến
  dht.begin();
  ds18b20.begin();
  Serial.println("[Setup] DHT & DS18B20 đã begin()");

  // 3) Khởi động HTTP modules
  httpSensor.begin();
  cameraModule.init();
  httpCamera.setTimeout(20000);
  Serial.println("[Setup] HTTP modules đã begin()");

  // 4) Thêm Task vào Scheduler
  ts.addTask(tReadSensors);
  ts.addTask(tUploadData);
  ts.addTask(tUploadImage);
  ts.addTask(tManagePump);

  // 5) Kích hoạt các Task
  tReadSensors.enable();
  tUploadData.enable();
  tUploadImage.enable();
  tManagePump.enable();
  Serial.println("[Setup] Các Task đã enable()");

  Serial.println("===== Setup() hoàn tất =====\n");
}

void loop() {
  // Cập nhật LED nếu đang trong chế độ blink non‐blocking
  errorLed.update();

  // Thực thi TaskScheduler (kiểm tra và gọi callback khi đến thời điểm)
  ts.execute();
}

// ---------- TASK FUNCTIONS ----------

void readSensorsCallback() {
  Serial.println("[DEBUG] => readSensorsCallback()");

  // Đọc DHT (cập nhật ít nhất 2s/lần)
  dht.update();
  ambientTemp = dht.getTemperature();
  humidity    = dht.getHumidity();

  // Đọc DS18B20
  waterTemp = ds18b20.getTemperature();

  // Xác định lỗi
  ds18b20Err = isnan(waterTemp);
  dhtErr     = (!dht.hasData()) || isnan(ambientTemp) || isnan(humidity);
  wifiErr    = !wifi.isConnected();

  // Nếu WiFi chưa kết nối, thử connect lại
  if (wifiErr) {
    Serial.println("⚠️ [readSensors] WiFi chưa kết nối, gọi wifi.connect() lại...");
    wifi.connect();
  }

  // Nháy LED báo lỗi (nếu có)
  indicateError(wifiErr, ds18b20Err, dhtErr);

  // In log kết quả
  if (ds18b20Err) {
    Serial.println("[DEBUG] DS18B20 LỖI – trả NAN");
  } else {
    Serial.printf("[DEBUG] DS18B20 nhiệt độ = %.1f°C\n", waterTemp);
  }

  if (dhtErr) {
    Serial.println("[DEBUG] DHT22 LỖI hoặc chưa có data");
  } else {
    Serial.printf("[DEBUG] DHT22 Temp = %.1f°C, Hum = %.1f%%\n", ambientTemp, humidity);
  }

  Serial.println("---");
}

void uploadDataCallback() {
  Serial.println("[DEBUG] => uploadDataCallback()");

  // Giả lập pH, EC, ORP
  float ph  = 7.0;
  float ec  = 1.5;
  int   orp = 400;

  size_t jsonLen = buildJsonSnapshots(
    jsonBuffer, sizeof(jsonBuffer),
    waterTemp, ambientTemp, humidity,
    ph, ec, orp
  );
  Serial.printf("[DEBUG] buildJsonSnapshots() trả về length = %u\n", (unsigned)jsonLen);

  if (jsonLen > 0) {
    bool ok = httpSensor.sendData(jsonBuffer, jsonLen);
    Serial.printf("[DEBUG] httpSensor.sendData() trả về %s\n", ok ? "true" : "false");
    if (ok) {
      Serial.println("✅ [uploadData] Gửi dữ liệu API thành công");
    } else {
      Serial.println("❌ [uploadData] Gửi dữ liệu API thất bại");
    }
  } else {
    Serial.println("❌ [uploadData] Tạo JSON payload thất bại");
  }
}

void uploadImageCallback() {
  Serial.println("[DEBUG] => uploadImageCallback()");

  if (!wifi.isConnected()) {
    Serial.println("⚠️ [uploadImage] Bỏ qua gửi ảnh vì WiFi mất kết nối");
    return;
  }

  camera_fb_t* fb = cameraModule.capture();
  if (fb) {
    unsigned long duration;
    bool ok = httpCamera.send(fb, duration);
    Serial.printf("[DEBUG] httpCamera.send() trả về %s, thời gian = %lums\n", ok ? "true" : "false", duration);
    if (ok) {
      Serial.printf("✅ [uploadImage] Gửi ảnh OK, mất %lums\n", duration);
    } else {
      Serial.println("❌ [uploadImage] Gửi ảnh thất bại");
    }
    cameraModule.release(fb);
  } else {
    Serial.println("❌ [uploadImage] Không chụp được frame");
  }
}

void managePumpCallback() {
  Serial.println("[DEBUG] => managePumpCallback()");
  if (!pumpIsOn) {
    // Bật bơm (relay active‐HIGH)
    pumpRelay.turnOn();
    pumpIsOn = true;
    Serial.println("💧 [Pump] BẬT");

    // Sau PUMP_ON_MS sẽ tắt
    tManagePump.setInterval(PUMP_ON_MS);
    tManagePump.restart();
  } else {
    // Tắt bơm
    pumpRelay.turnOff();
    pumpIsOn = false;
    Serial.println("💧 [Pump] TẮT");

    // Sau PUMP_CYCLE_MS sẽ bật lại
    tManagePump.setInterval(PUMP_CYCLE_MS);
    tManagePump.restart();
  }
}

void indicateError(bool wifiErr, bool dsErr, bool dhtErr) {
  if (wifiErr) {
    Serial.println("[LED] Nháy báo lỗi WiFi (4 lần)");
    errorLed.blink(4, 200);
  } else if (dsErr) {
    Serial.println("[LED] Nháy báo lỗi DS18B20 (3 lần)");
    errorLed.blink(3, 200);
  } else if (dhtErr) {
    Serial.println("[LED] Nháy báo lỗi DHT22 (2 lần)");
    errorLed.blink(2, 200);
  } else {
    errorLed.off();
  }
}
