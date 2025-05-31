#include <Arduino.h>

#include "wifi_module.h"
#include "api_module.h"
#include "dht_module.h"
#include "ds18b20_module.h"
#include "json_builder.h"
#include "relay_module.h"
#include "camera_module.h"
#include "led_indicator.h"

// Thông tin WiFi và API
const char *ssid        = "Mai Lan";
const char *password    = "1234567899";
const char *apiUrl      = "https://my.duocnv.top/v1/hydroponics/snapshots";
const char *deviceToken = "esp32";
const char *deviceId    = "device-001";

// Khởi tạo các module
WifiModule    wifi(ssid, password);
ApiModule     api(apiUrl, deviceToken, deviceId);
DHTModule     dht;
DS18B20Module ds18b20;
RelayModule   pumpRelay(12);
LedIndicator  error(4);
// CameraModule camera;   // Nếu cần dùng camera, mở dòng này

// Bộ đệm JSON
char jsonBuffer[512];

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Kết nối WiFi
  wifi.connect();

  // Khởi động DHT22
  dht.begin();

  // Khởi động DS18B20
  ds18b20.begin();

  // Khởi động API (nếu có cấu hình gì thêm)
  api.begin();

  // (Tuỳ chọn) Khởi động camera
  // if (!camera.begin()) {
  //   Serial.println("❌ Khởi tạo camera thất bại");
  // } else {
  //   Serial.println("✅ Camera đã sẵn sàng");
  // }

  // Lưu ý: RelayModule và LedIndicator không có hàm begin(),
  // nên không cần gọi pumpRelay.begin() hay error.begin() ở đây.
}

void loop() {
  // Nếu WiFi chưa kết nối, cố gắng kết nối lại
  if (!wifi.isConnected()) {
    Serial.println("WiFi chưa kết nối, đang cố gắng kết nối lại...");
    error.blink(1);
    wifi.connect();
  }

  // Mở bơm relay 5 giây, sau đó tắt
  Serial.println("💧 Bật bơm relay trong 5 giây");
  pumpRelay.turnOn();
  delay(5000);
  pumpRelay.turnOff();
  Serial.println("💧 Đã tắt bơm relay");

  // --- Đọc nhiệt độ nước từ DS18B20 ---
  float waterTemp = ds18b20.getTemperature();
  if (isnan(waterTemp)) {
    // Nếu DS18B20 trả NaN (thiết bị ngắt/lỗi), nháy LED 3 lần
    error.blink(3);
    Serial.println("ERROR: DS18B20 disconnected or read failed!");
  }

  // --- Đọc nhiệt độ và độ ẩm từ DHT22 ---
  float ambientTemp = dht.getTemperature();
  float humidity    = dht.getHumidity();
  if (isnan(ambientTemp) || isnan(humidity)) {
    // Nếu DHT22 trả NaN (lỗi hoặc gọi quá sớm), nháy LED 2 lần
    error.blink(2);
    Serial.println("ERROR: DHT22 read failed (NaN).");
  }

  // In ra màn hình Serial
  Serial.print("🌡️ Nhiệt độ nước: ");
  if (!isnan(waterTemp)) {
    Serial.print(waterTemp);
    Serial.println(" °C");
  } else {
    Serial.println("--");
  }

  Serial.print("🌡️ Nhiệt độ môi trường: ");
  if (!isnan(ambientTemp)) {
    Serial.print(ambientTemp);
    Serial.println(" °C");
  } else {
    Serial.println("--");
  }

  Serial.print("💧 Độ ẩm: ");
  if (!isnan(humidity)) {
    Serial.print(humidity);
    Serial.println(" %");
  } else {
    Serial.println("--");
  }

  // --- Dữ liệu giả định cho pH, EC, ORP ---
  float ph  = 7.0;
  float ec  = 1.5;
  int   orp = 200;

  // --- Tạo JSON payload và gửi lên server ---
  size_t jsonLen = buildJsonSnapshots(
    jsonBuffer, sizeof(jsonBuffer),
    waterTemp, ambientTemp, humidity,
    ph, ec, orp
  );

  if (jsonLen > 0) {
    if (!api.sendData(jsonBuffer, jsonLen)) {
      Serial.println("❌ Gửi dữ liệu API thất bại");
    } else {
      Serial.println("✅ Gửi dữ liệu API thành công");
    }
  } else {
    Serial.println("❌ Tạo JSON payload thất bại");
  }

  // --- (Tùy chọn) Chụp và gửi ảnh lên server ---
  // camera_fb_t *fb = camera.capture();
  // if (fb) {
  //   if (api.sendImage(fb->buf, fb->len)) {
  //     Serial.println("✅ Gửi ảnh thành công");
  //   } else {
  //     Serial.println("❌ Gửi ảnh thất bại");
  //   }
  //   camera.release(fb);  // Quan trọng
  // } else {
  //   Serial.println("❌ Không chụp được ảnh");
  // }

  // Chờ 60 giây trước khi lặp lại
  delay(60000);
}
