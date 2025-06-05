#ifndef HTTP_CONFIG_MODULE_H
#define HTTP_CONFIG_MODULE_H

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// Nếu server trả về các khoảng thời gian (ms), lưu vào struct này
struct DynamicIntervals {
  uint32_t SENSOR_INTERVAL;
  uint32_t DATA_INTERVAL;
  uint32_t IMAGE_INTERVAL;
  uint32_t PUMP_CYCLE_MS;
  uint32_t PUMP_ON_MS;
};

class HttpConfigModule {
private:
  const char* host;
  const int   port;
  const char* path;         // Ví dụ "/device-config"
  const char* deviceToken;
  const char* deviceId;
  WiFiClientSecure client;
  String rawResponse;

public:
  // Các trường sẽ được gán khi parse JSON
  String wifi_ssid;
  String wifi_password;
  String configured_host;
  uint16_t configured_port;
  String sensorPath;    // Đổi tên cho khớp với main
  String imgPath;       // Đổi tên cho khớp với main

  // Nếu server trả các khoảng thời gian động, lưu ở đây; nếu không = 0
  DynamicIntervals intervals;

  // Nếu server trả deep sleep (us) và pump time (ms), lưu ở đây; nếu không = 0
  uint64_t deep_sleep_interval_us;
  uint32_t pump_on_time_ms;

  HttpConfigModule(const char* h, int p, const char* pa, const char* token, const char* id)
    : host(h), port(p), path(pa), deviceToken(token), deviceId(id)
  {
    client.setInsecure();
    wifi_ssid                = "";
    wifi_password            = "";
    configured_host          = "";
    configured_port          = 0;
    sensorPath               = "";
    imgPath                  = "";
    deep_sleep_interval_us   = 0;
    pump_on_time_ms          = 0;
    intervals.SENSOR_INTERVAL = 0;
    intervals.DATA_INTERVAL   = 0;
    intervals.IMAGE_INTERVAL  = 0;
    intervals.PUMP_CYCLE_MS   = 0;
    intervals.PUMP_ON_MS      = 0;
  }

  /**
   * Gửi GET /device-config?device_id=...&device_token=...
   * Parse JSON body, gán vào các biến public.
   * Trả về true nếu thành công, false nếu có lỗi.
   */
  bool fetchConfig() {
    rawResponse = "";

    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("🚫 [Config] WiFi chưa kết nối");
      return false;
    }

    // Xây dựng path kèm query string
    String fullPath = String(path) +
                      "?device_id=" + deviceId +
                      "&device_token=" + deviceToken;

    Serial.printf("🛠 [Config] Kết nối SSL tới %s:%d (GET %s)\n", host, port, fullPath.c_str());
    if (!client.connect(host, port)) {
      Serial.println("❌ [Config] Kết nối SSL thất bại");
      return false;
    }

    // Tạo request GET HTTP/1.1
    String request = String("GET ") + fullPath + " HTTP/1.1\r\n" +
                     "Host: " + host + "\r\n" +
                     "Connection: close\r\n\r\n";

    client.print(request);
    unsigned long timeout = millis();
    while (client.connected() && millis() - timeout < 5000) {
      while (client.available()) {
        String line = client.readStringUntil('\n');
        rawResponse += line + "\n";
        timeout = millis();
      }
      delay(10);
    }
    client.stop();

    if (rawResponse.length() == 0) {
      Serial.println("⚠️ [Config] Không nhận được response");
      return false;
    }

    Serial.println("📥 [Config] Response thô:");
    Serial.println(rawResponse);

    // Tách phần body JSON (sau dấu "\r\n\r\n")
    int idx = rawResponse.indexOf("\r\n\r\n");
    if (idx < 0) {
      Serial.println("❌ [Config] Không tách được phần body JSON");
      return false;
    }
    String jsonPart = rawResponse.substring(idx + 4);

    Serial.println("🔍 [Config] JSON Body:");
    Serial.println(jsonPart);

    StaticJsonDocument<1024> doc;
    DeserializationError err = deserializeJson(doc, jsonPart);
    if (err) {
      Serial.print("❌ [Config] Lỗi parse JSON: ");
      Serial.println(err.f_str());
      return false;
    }

    // Gán từng trường nếu tồn tại
    if (doc.containsKey("wifi_ssid")) {
      wifi_ssid = String((const char*)doc["wifi_ssid"]);
    }
    if (doc.containsKey("wifi_password")) {
      wifi_password = String((const char*)doc["wifi_password"]);
    }
    if (doc.containsKey("host")) {
      configured_host = String((const char*)doc["host"]);
    }
    if (doc.containsKey("port")) {
      configured_port = doc["port"].as<uint16_t>();
    }
    if (doc.containsKey("sensorPath")) {
      sensorPath = String((const char*)doc["sensorPath"]);
    }
    if (doc.containsKey("imgPath")) {
      imgPath = String((const char*)doc["imgPath"]);
    }
    // Lấy các interval (ms) nếu server có trả
    if (doc.containsKey("SENSOR_INTERVAL")) {
      intervals.SENSOR_INTERVAL = doc["SENSOR_INTERVAL"].as<uint32_t>();
    }
    if (doc.containsKey("DATA_INTERVAL")) {
      intervals.DATA_INTERVAL = doc["DATA_INTERVAL"].as<uint32_t>();
    }
    if (doc.containsKey("IMAGE_INTERVAL")) {
      intervals.IMAGE_INTERVAL = doc["IMAGE_INTERVAL"].as<uint32_t>();
    }
    if (doc.containsKey("PUMP_CYCLE_MS")) {
      intervals.PUMP_CYCLE_MS = doc["PUMP_CYCLE_MS"].as<uint32_t>();
    }
    if (doc.containsKey("PUMP_ON_MS")) {
      intervals.PUMP_ON_MS = doc["PUMP_ON_MS"].as<uint32_t>();
    }
    // Lấy deep sleep (us) và pump_on_time_ms (ms) nếu có
    if (doc.containsKey("deep_sleep_interval_us")) {
      deep_sleep_interval_us = doc["deep_sleep_interval_us"].as<uint64_t>();
    }
    if (doc.containsKey("pump_on_time_ms")) {
      pump_on_time_ms = doc["pump_on_time_ms"].as<uint32_t>();
    }

    Serial.println("✅ [Config] Đã parse và lưu cấu hình:");
    Serial.printf("  wifi_ssid: %s\n", wifi_ssid.c_str());
    Serial.printf("  wifi_password: %s\n", wifi_password.c_str());
    Serial.printf("  host: %s\n", configured_host.c_str());
    Serial.printf("  port: %u\n", configured_port);
    Serial.printf("  sensorPath: %s\n", sensorPath.c_str());
    Serial.printf("  imgPath: %s\n", imgPath.c_str());
    Serial.printf("  SENSOR_INTERVAL: %u ms\n", intervals.SENSOR_INTERVAL);
    Serial.printf("  DATA_INTERVAL: %u ms\n", intervals.DATA_INTERVAL);
    Serial.printf("  IMAGE_INTERVAL: %u ms\n", intervals.IMAGE_INTERVAL);
    Serial.printf("  PUMP_CYCLE_MS: %u ms\n", intervals.PUMP_CYCLE_MS);
    Serial.printf("  PUMP_ON_MS: %u ms\n", intervals.PUMP_ON_MS);
    Serial.printf("  deep_sleep_interval_us: %llu\n", deep_sleep_interval_us);
    Serial.printf("  pump_on_time_ms: %u ms\n", pump_on_time_ms);

    return true;
  }

  const String& getRawResponse() const {
    return rawResponse;
  }
};

#endif // HTTP_CONFIG_MODULE_H
