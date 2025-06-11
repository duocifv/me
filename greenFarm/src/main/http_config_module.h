#ifndef HTTP_CONFIG_MODULE_H
#define HTTP_CONFIG_MODULE_H

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// Nếu server trả về các khoảng thời gian (ms), lưu vào struct này
struct DynamicIntervals
{
  uint32_t SENSOR_INTERVAL;
  uint32_t DATA_INTERVAL;#include <Arduino.h>
#include <Wire.h>
#include <PCF8574.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "wifi_module.h"
#include "http_config_module.h"
#include "http_sensors_module.h"
#include "http_camera_module.h"
#include "camera_module.h"
#include "config.h"   // chứa ssid, password, host, port, configPath, deviceToken, deviceId

// Nếu config.h chưa có, định nghĩa:
static const char* sensorEndpoint = "/v1/hydroponics/snapshots";
static const char* cameraEndpoint = "/v1/hydroponics/snapshots/images";

// —— CẤU HÌNH PHẦN CỨNG ——
#define I2C_SDA        21
#define I2C_SCL        22
#define EXP_ADDR       0x20
#define EXP_LED_PIN    0
#define DHT_PIN        4
#define DHT_TYPE       DHT22
#define ONE_WIRE_BUS   15
#define WIFI_FAIL_LED  4
#define WAKE_LED_PIN   33
#define SLEEP_TIME_US  (10ULL * 1000000ULL)

// —— RTC DATA ——
RTC_DATA_ATTR uint32_t wakeCount = 0;

// —— OBJECTS ——
PCF8574           expander(EXP_ADDR);
DHT               dht(DHT_PIN, DHT_TYPE);
OneWire           oneWire(ONE_WIRE_BUS);
DallasTemperature ds18b20(&oneWire);
WifiModule        wifi(ssid, password);
HttpConfigModule  httpConfig(host, port, configPath, deviceToken, deviceId);
HttpSensorsModule *httpSensor = nullptr;
HttpCameraModule  *httpCamera = nullptr;
CameraModule      cameraModule;

void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(WAKE_LED_PIN, OUTPUT);
  pinMode(WIFI_FAIL_LED, OUTPUT);
  digitalWrite(WAKE_LED_PIN, LOW);
  digitalWrite(WIFI_FAIL_LED, LOW);

  // 1) Wake count + LED báo
  wakeCount++;
  Serial.printf("\n--- Wake #%u (reason=%d) ---\n", wakeCount, esp_reset_reason());
  digitalWrite(WAKE_LED_PIN, HIGH);
  delay(150);
  digitalWrite(WAKE_LED_PIN, LOW);

  // 2) I2C scan + expander test
  Wire.begin(I2C_SDA, I2C_SCL);
  Serial.println("I2C scan:");
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.printf("  Found @ 0x%02X\n", addr); delay(5);
    }
  }
  if (expander.begin() != 0) { Serial.println("❌ PCF8574 init failed!"); while(1) delay(500); }
  Serial.println("✅ PCF8574 ready");
  for (int i=0;i<3;i++){ expander.write(EXP_LED_PIN,HIGH); delay(150); expander.write(EXP_LED_PIN,LOW); delay(150); }

  // 3) Sensors test
  dht.begin();
  float h = dht.readHumidity(), t=dht.readTemperature();
  Serial.printf("DHT22 → %s\n", (!isnan(h)&&!isnan(t)) ? String(t,1)+"°C, "+String(h,1)+"%" : "❌ failed");
  ds18b20.begin(); ds18b20.requestTemperatures();
  float tw = ds18b20.getTempCByIndex(0);
  Serial.printf("DS18B20 → %s\n", tw!=DEVICE_DISCONNECTED_C ? String(tw,1)+"°C" : "❌ failed");

  // 4) Camera test
  cameraModule.init();
  camera_fb_t *fb = cameraModule.capture();
  Serial.println(fb ? "✅ Camera OK" : "❌ Camera FAILED");
  if(fb) cameraModule.release(fb);

  // 5) WiFi connect
  Serial.print("Connecting WiFi");
  wifi.connect();
  uint32_t t0=millis();
  while(!wifi.isConnected() && millis()-t0<10000){ Serial.print("."); delay(500); }
  if(!wifi.isConnected()){
    Serial.println("\n❌ WiFi failed! Blink LED4");
    for(int i=0;i<5;i++){ digitalWrite(WIFI_FAIL_LED,HIGH); delay(200); digitalWrite(WIFI_FAIL_LED,LOW); delay(200); }
  } else {
    Serial.println("\n✅ WiFi connected");

    // 6) Test HttpConfigModule
    Serial.println("Fetching remote config...");
    if(httpConfig.fetchConfig()){
      Serial.println("✅ Config fetched:");
      Serial.printf("  wifi_ssid: %s\n", httpConfig.wifi_ssid.c_str());
      Serial.printf("  wifi_password: %s\n", httpConfig.wifi_password.c_str());
      Serial.printf("  deepSleepIntervalUs: %llu\n", httpConfig.deep_sleep_interval_us);
      Serial.printf("  pumpOnTimeMs: %u\n", httpConfig.pump_on_time_ms);
      Serial.printf("  sensorPath: %s\n", httpConfig.sensorPath.c_str());
      Serial.printf("  imgPath: %s\n", httpConfig.imgPath.c_str());
      Serial.printf("  host: %s\n", httpConfig.configured_host.c_str());
      Serial.printf("  port: %u\n", httpConfig.configured_port);
    } else {
      Serial.println("❌ Config fetch failed");
    }

    // 7) Send sensor data
    snprintf(jsonBuf, sizeof(jsonBuf),
      "{\"deviceId\":\"%s\",\"ambientTemp\":%s,\"humidity\":%s,\"waterTemp\":%s}",
      deviceId,
      (!isnan(t) ? String(t,1).c_str() : "null"),
      (!isnan(h) ? String(h,1).c_str() : "null"),
      (tw!=DEVICE_DISCONNECTED_C ? String(tw,1).c_str() : "null")
    );
    httpSensor = new HttpSensorsModule(httpConfig.configured_host.c_str(),
                                       httpConfig.configured_port,
                                       httpConfig.sensorPath.c_str(),
                                       deviceToken, deviceId);
    Serial.print("Sending sensor data... ");
    Serial.println(httpSensor->sendData(jsonBuf, strlen(jsonBuf)) ? "✅" : "❌");
    delete httpSensor;

    // 8) Send camera image
    if(fb){
      httpCamera = new HttpCameraModule(httpConfig.configured_host.c_str(),
                                        httpConfig.configured_port,
                                        httpConfig.imgPath.c_str(),
                                        deviceToken, deviceId);
      httpCamera->setTimeout(20000);
      unsigned long dur;
      Serial.print("Sending camera image... ");
      Serial.println(httpCamera->send(fb, dur) ? "✅":"❌");
      delete httpCamera;
    }
  }

  // 9) Deep sleep
  Serial.printf("Sleeping %llu us...\n", SLEEP_TIME_US);
  delay(100);
  esp_sleep_enable_timer_wakeup(SLEEP_TIME_US);
  esp_deep_sleep_start();
}

void loop() {
  // not used
}

  uint32_t IMAGE_INTERVAL;
  uint32_t PUMP_CYCLE_MS;
  uint32_t PUMP_ON_MS;
};

class HttpConfigModule
{
private:
  const char *host;
  const int port;
  const char *path; // Ví dụ "/device-config"
  const char *deviceToken;
  const char *deviceId;
  WiFiClientSecure client;
  String rawResponse;

public:
  // Các trường sẽ được gán khi parse JSON
  String wifi_ssid;
  String wifi_password;
  String configured_host;
  uint16_t configured_port;
  String sensorPath; // Đổi tên cho khớp với main
  String imgPath;    // Đổi tên cho khớp với main

  // Nếu server trả các khoảng thời gian động, lưu ở đây; nếu không = 0
  DynamicIntervals intervals;

  // Nếu server trả deep sleep (us) và pump time (ms), lưu ở đây; nếu không = 0
  uint64_t deep_sleep_interval_us;
  uint32_t pump_on_time_ms;

  HttpConfigModule(const char *h, int p, const char *pa, const char *token, const char *id)
      : host(h), port(p), path(pa), deviceToken(token), deviceId(id)
  {
    client.setInsecure();
    wifi_ssid = "";
    wifi_password = "";
    configured_host = "";
    configured_port = 0;
    sensorPath = "";
    imgPath = "";
    deep_sleep_interval_us = 0;
    pump_on_time_ms = 0;
    intervals.SENSOR_INTERVAL = 0;
    intervals.DATA_INTERVAL = 0;
    intervals.IMAGE_INTERVAL = 0;
    intervals.PUMP_CYCLE_MS = 0;
    intervals.PUMP_ON_MS = 0;
  }

  /**
   * Gửi GET /device-config?device_id=...&device_token=...
   * Parse JSON body, gán vào các biến public.
   * Trả về true nếu thành công, false nếu có lỗi.
   */
  bool fetchConfig()
  {
    rawResponse = "";

    if (WiFi.status() != WL_CONNECTED)
    {
      Serial.println("🚫 [Config] WiFi chưa kết nối");
      return false;
    }

    // Ghi log, path là const char*
    Serial.printf("🛠 [Config] Kết nối SSL tới %s:%d (GET %s)\n", host, port, path);
    if (!client.connect(host, port))
    {
      Serial.println("❌ [Config] Kết nối SSL thất bại");
      return false;
    }

    // Tạo request GET HTTP/1.1
    String request = String("GET ") + path + " HTTP/1.1\r\n" +
                     "Host: " + host + "\r\n" +
                     "Content-Type: application/json\r\n" +
                     "x-device-token: " + deviceToken + "\r\n" +
                     "x-device-id: " + deviceId + "\r\n" +
                     "Connection: close\r\n\r\n";

    client.print(request);
    unsigned long timeout = millis();
    while (client.connected() && millis() - timeout < 5000)
    {
      while (client.available())
      {
        String line = client.readStringUntil('\n');
        rawResponse += line + "\n";
        timeout = millis();
      }
      delay(10);
    }
    client.stop();

    if (rawResponse.length() == 0)
    {
      Serial.println("⚠️ [Config] Không nhận được response");
      return false;
    }

    Serial.println("📥 [Config] Response thô:");
    Serial.println(rawResponse);

    // Tách phần body JSON (sau dấu "\r\n\r\n")
    int idx = rawResponse.indexOf("\r\n\r\n");
    if (idx < 0)
    {
      Serial.println("❌ [Config] Không tách được phần body JSON");
      return false;
    }
    String jsonPart = rawResponse.substring(idx + 4);

    Serial.println("🔍 [Config] JSON Body:");
    Serial.println(jsonPart);

    StaticJsonDocument<1024> doc;
    DeserializationError err = deserializeJson(doc, jsonPart);
    if (err)
    {
      Serial.print("❌ [Config] Lỗi parse JSON: ");
      Serial.println(err.f_str());
      return false;
    }

    // Gán từng trường nếu tồn tại
    if (doc.containsKey("wifiSsid"))
    {
      wifi_ssid = String((const char *)doc["wifiSsid"]);
    }
    if (doc.containsKey("wifiPassword"))
    {
      wifi_password = String((const char *)doc["wifiPassword"]);
    }
    if (doc.containsKey("host"))
    {
      configured_host = String((const char *)doc["host"]);
    }
    if (doc.containsKey("port"))
    {
      configured_port = doc["port"].as<uint16_t>();
    }
    if (doc.containsKey("sensorEndpoint"))
    {
      sensorPath = String((const char *)doc["sensorEndpoint"]);
    }
    if (doc.containsKey("cameraEndpoint"))
    {
      imgPath = String((const char *)doc["cameraEndpoint"]);
    }
    // Lấy các interval (ms) nếu server có trả
    if (doc.containsKey("sensorInterval"))
    {
      intervals.SENSOR_INTERVAL = doc["sensorInterval"].as<uint32_t>();
    }
    if (doc.containsKey("dataInterval"))
    {
      intervals.DATA_INTERVAL = doc["dataInterval"].as<uint32_t>();
    }
    if (doc.containsKey("imageInterval"))
    {
      intervals.IMAGE_INTERVAL = doc["imageInterval"].as<uint32_t>();
    }
    if (doc.containsKey("pumpCycleMs"))
    {
      intervals.PUMP_CYCLE_MS = doc["pumpCycleMs"].as<uint32_t>();
    }
    if (doc.containsKey("pumpOnMs"))
    {
      intervals.PUMP_ON_MS = doc["pumpOnMs"].as<uint32_t>();
    }
    // Lấy deep sleep (us) và pump_on_time_ms (ms) nếu có
    if (doc.containsKey("deepSleepIntervalUs"))
    {
      deep_sleep_interval_us = doc["deepSleepIntervalUs"].as<uint64_t>();
    }
    if (doc.containsKey("pumpOnTimeMs"))
    {
      pump_on_time_ms = doc["pumpOnTimeMs"].as<uint32_t>();
    }

    Serial.println("✅ [Config] Đã parse và lưu cấu hình:");
    Serial.printf("  wifiSsid: %s\n", wifi_ssid.c_str());
    Serial.printf("  wifiPassword: %s\n", wifi_password.c_str());
    Serial.printf("  host: %s\n", configured_host.c_str());
    Serial.printf("  port: %u\n", configured_port);
    Serial.printf("  sensorEndpoint: %s\n", sensorPath.c_str());
    Serial.printf("  cameraEndpoint: %s\n", imgPath.c_str());
    Serial.printf("  sensorInterval: %u ms\n", intervals.SENSOR_INTERVAL);
    Serial.printf("  dataInterval: %u ms\n", intervals.DATA_INTERVAL);
    Serial.printf("  imageInterval: %u ms\n", intervals.IMAGE_INTERVAL);
    Serial.printf("  pumpCycleMs: %u ms\n", intervals.PUMP_CYCLE_MS);
    Serial.printf("  pumpOnMs: %u ms\n", intervals.PUMP_ON_MS);
    Serial.printf("  deepSleepIntervalUs: %llu\n", deep_sleep_interval_us);
    Serial.printf("  pumpOnTimeMs: %u ms\n", pump_on_time_ms);

    return true;
  }

  const String &getRawResponse() const
  {
    return rawResponse;
  }
};

#endif // HTTP_CONFIG_MODULE_H
