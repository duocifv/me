#include <Arduino.h>
#include "driver/rtc_io.h"
#include "esp_sleep.h"      // cần include để gọi esp_sleep_enable_timer_wakeup()
    
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

// ----- Các hằng số Deep Sleep -----
// Ví dụ: ngủ 5 phút = 5*60 giây = 300 giây = 300e6 microseconds
#define DEEP_SLEEP_INTERVAL_US  (5ULL * 60ULL * 1000000ULL)

// Thời gian chạy bơm mỗi lần wake (5 giây)
#define PUMP_ON_TIME_MS         5000

// ----- Các mô-đun (giữ nguyên) -----
WifiModule      wifi(ssid, password);
DHTModule       dht;
DS18B20Module   ds18b20;
RelayModule     pumpRelay(12, false);   // activeLow = false → HIGH bật bơm
LedIndicator    errorLed(4);
CameraModule    cameraModule;
HttpSensorModule httpSensor(host, port, sensorPath, deviceToken, deviceId);
HttpCameraModule httpCamera(host, port, imgPath, deviceToken, deviceId);

// Buffer để chứa JSON
char jsonBuffer[512];

// ----- Biến trạng thái (lưu qua RTC memory nếu cần) -----
RTC_DATA_ATTR bool pumpHasRun = false;  
// Nếu bạn muốn mỗi lần wake chỉ chạy bơm 1 lần, dùng biến này để không chạy lại nhiều lần.

// Trạng thái lỗi
bool wifiErr     = false;
bool ds18b20Err  = false, dhtErr = false;

// Giá trị sensor để log
float waterTemp = NAN, ambientTemp = NAN, humidity = NAN;

// ----- Prototype hàm phụ -----
void indicateError(bool wifiErr, bool dsErr, bool dhtErr);

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n===== Wake from Deep Sleep (setup) =====");

  // 1) Kết nối WiFi
  wifi.connect();
  if (!wifi.isConnected()) {
    Serial.println("⚠️ [Setup] WiFi không kết nối được");
    wifiErr = true;
  } else {
    wifiErr = false;
    Serial.println("[Setup] WiFi đã kết nối");
  }

  // 2) Khởi động cảm biến
  dht.begin();
  ds18b20.begin();
  delay(200); // cho cảm biến ổn định
  Serial.println("[Setup] Cảm biến DHT & DS18B20 đã begin()");

  // 3) Đọc sensor ngay
  // --- Đọc DHT22 ---
  dht.update();
  if (!dht.hasData()) {
    dhtErr = true;
    Serial.println("⚠️ [readSensors] Lỗi đọc DHT22");
  } else {
    dhtErr      = false;
    ambientTemp = dht.getTemperature();
    humidity    = dht.getHumidity();
  }

  // --- Đọc DS18B20 ---
  float tempDS = ds18b20.getTemperature();
  if (isnan(tempDS)) {
    ds18b20Err = true;
    Serial.println("⚠️ [readSensors] Lỗi đọc DS18B20");
  } else {
    ds18b20Err = false;
    waterTemp  = tempDS;
  }

  // 4) Nháy LED báo lỗi (nếu có)
  indicateError(wifiErr, ds18b20Err, dhtErr);

  // 5) Nếu WiFi ok và sensor ok, gửi dữ liệu lên server
  if (!wifiErr && !dhtErr && !ds18b20Err) {
    // Giả lập pH, EC, ORP
    float ph  = 7.0;
    float ec  = 1.5;
    int   orp = 400;

    size_t jsonLen = buildJsonSnapshots(
      jsonBuffer, sizeof(jsonBuffer),
      waterTemp, ambientTemp, humidity,
      ph, ec, orp
    );
    Serial.printf("[Setup] buildJsonSnapshots() length = %u\n", (unsigned)jsonLen);

    if (jsonLen > 0) {
      bool ok = httpSensor.sendData(jsonBuffer, jsonLen);
      Serial.printf("[Setup] httpSensor.sendData() → %s\n", ok ? "true" : "false");
      if (ok) {
        Serial.println("✅ [uploadData] Gửi dữ liệu API thành công");
      } else {
        Serial.println("❌ [uploadData] Gửi dữ liệu API thất bại");
      }
    } else {
      Serial.println("❌ [uploadData] Tạo JSON payload thất bại");
    }
  } else {
    Serial.println("⚠️ [uploadData] Bỏ qua gửi dữ liệu do có lỗi WiFi hoặc sensor");
  }

  // 6) Chụp ảnh và gửi (nếu WiFi vẫn còn)
  if (!wifiErr) {
    cameraModule.init(); // Khởi động module camera (ESP32-CAM cần init mỗi lần wake)
    httpCamera.setTimeout(20000);

    camera_fb_t* fb = cameraModule.capture();
    if (fb) {
      unsigned long duration;
      bool ok = httpCamera.send(fb, duration);
      Serial.printf("[Setup] httpCamera.send() → %s, time = %lums\n", ok ? "true" : "false", duration);
      if (ok) {
        Serial.printf("✅ [uploadImage] Gửi ảnh OK, mất %lums\n", duration);
      } else {
        Serial.println("❌ [uploadImage] Gửi ảnh thất bại");
      }
      cameraModule.release(fb);
    } else {
      Serial.println("❌ [uploadImage] Không chụp được frame");
    }
  } else {
    Serial.println("⚠️ [uploadImage] Bỏ qua gửi ảnh vì WiFi mất kết nối");
  }

  // 7) Quản lý bơm: nếu chưa chạy lần nào (pumpHasRun = false), bật bơm 5s rồi tắt
  if (!pumpHasRun) {
    Serial.println("💧 [Pump] Lần wake đầu tiên: BẬT bơm 5 giây");
    pumpRelay.turnOn();
    delay(PUMP_ON_TIME_MS);
    pumpRelay.turnOff();
    Serial.println("💧 [Pump] Đã TẮT bơm sau 5 giây");
    pumpHasRun = true;
  } else {
    Serial.println("💧 [Pump] Đã chạy bơm rồi, lần này bỏ qua");
  }

  // 8) Chuẩn bị đi vào Deep Sleep
  Serial.println("===== Tất cả các công việc đã xong, ESP sẽ vào Deep Sleep =====");
  delay(500); // cho Serial kịp gửi hết dữ liệu

  // **Chú ý**: đổi tên hàm gọi wake‐up từ timer
  esp_sleep_enable_timer_wakeup(DEEP_SLEEP_INTERVAL_US);
  esp_deep_sleep_start();

  // Sau khi gọi esp_deep_sleep_start(), ESP lập tức reset và chạy lại từ setup()
}

void loop() {
  // Không bao giờ chạy, vì toàn bộ logic nằm trong setup()
}

// --------- Hàm phụ: LED báo lỗi (không blocking) ----------
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
