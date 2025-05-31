#include <Arduino.h>

#include "wifi_module.h"
#include "api_module.h"
#include "dht_module.h"
#include "ds18b20_module.h"
#include "json_builder.h"
#include "relay_module.h"
#include "camera_module.h"
// #include "bh1750_module.h"
#include "led_indicator.h"

// Thông tin WiFi và API
const char *ssid = "Mai Lan T2";
const char *password = "1234567899";
const char *apiUrl = "https://my.duocnv.top/v1/hydroponics/snapshots";
const char *deviceToken = "esp32";
const char *deviceId = "device-001";

// Khởi tạo các module
WifiModule wifi(ssid, password);
ApiModule api(apiUrl, deviceToken, deviceId);
DHTModule dht;
DS18B20Module ds18b20;
// BH1750Module lightSensor;
RelayModule pumpRelay(12);
LedIndicator errorLed(4);
// CameraModule camera;

char jsonBuffer[512];

void indicateError(bool ds18b20Err, bool dhtErr) {
  if (ds18b20Err) errorLed.blink(3, 200);
  else if (dhtErr) errorLed.blink(2, 200);
  else errorLed.off();
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  wifi.connect();
  dht.begin();
  ds18b20.begin();
  // lightSensor.begin();
  api.begin();
  // camera.begin();
}

void loop() {
  dht.update();

  // 2) Đọc DS18B20 – thêm delay để chắc chắn conversion xong
  ds18b20.getTemperature();  // gọi requestTemperatures() bên trong
  delay(250);                // chờ 200ms conversion cho độ phân giải 10-bit
  float waterTemp = ds18b20.getTemperature();

  // 3) Đọc DHT22 (giá trị đã lưu trong dht.update())
  float ambientTemp = dht.getTemperature();
  float humidity = dht.getHumidity();



  bool ds18b20Error = isnan(waterTemp);
  bool dhtError = isnan(ambientTemp) || isnan(humidity);

  if (ds18b20Error) Serial.println("ERROR: DS18B20 disconnected or read failed!");
  if (dhtError) Serial.println("ERROR: DHT22 read failed (NaN).");

  indicateError(ds18b20Error, dhtError);

  Serial.print("🌡️ Nhiệt độ nước: ");
  Serial.println(ds18b20Error ? "--" : String(waterTemp) + " °C");

  Serial.print("🌡️ Nhiệt độ môi trường: ");
  Serial.println(dhtError ? "--" : String(ambientTemp) + " °C");

  Serial.print("💧 Độ ẩm: ");
  Serial.println(dhtError ? "--" : String(humidity) + " %");


  if (!wifi.isConnected()) {
    Serial.println("WiFi chưa kết nối, đang cố gắng kết nối lại...");
    errorLed.blink(1, 300);
    wifi.connect();
  }

  Serial.println("💧 Bật bơm relay trong 5 giây");
  pumpRelay.turnOn();
  delay(5000);
  pumpRelay.turnOff();
  Serial.println("💧 Đã tắt bơm relay");


  // Dữ liệu giả định cho pH, EC, ORP
  float ph = 7.0;
  float ec = 1.5;
  int orp = 400;


  size_t jsonLen = buildJsonSnapshots(
    jsonBuffer, sizeof(jsonBuffer),
    waterTemp, ambientTemp, humidity,
    ph, ec, orp);

  if (jsonLen > 0) {
    if (api.sendData(jsonBuffer, jsonLen)) {
      Serial.println("✅ Gửi dữ liệu API thành công");
    } else {
      Serial.println("❌ Gửi dữ liệu API thất bại");
    }
  } else {
    Serial.println("❌ Tạo JSON payload thất bại");
  }

  // delay 60 giây
  delay(60000);
}
