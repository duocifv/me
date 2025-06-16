#ifndef HTTP_CONFIG_MODULE_H
#define HTTP_CONFIG_MODULE_H

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// ==== STRUCTS ====

struct DynamicIntervals {
  uint32_t sensorInterval;
  uint32_t dataInterval;
  uint32_t imageInterval;
  uint32_t pumpCycleMs;
  uint32_t pumpOnMs;
  uint32_t pumpOffMs;
  uint32_t ledCycleMs;
  uint32_t ledOnMs;
  uint32_t ledOffMs;
};

struct ScheduleHours {
  uint8_t pumpStartHour;
  uint8_t pumpEndHour;
  uint8_t ledStartHour;
  uint8_t ledEndHour;
};

struct FanSchedule {
  uint32_t smallOnMs;
  uint32_t smallOffMs;
  bool largeContinuous;
  uint32_t largeOnMs;
  uint32_t largeOffMs;
};

// ==== CLASS ====

class HttpConfigModule {
private:
  const char* host;
  const int port;
  const char* path;
  const char* deviceToken;
  const char* deviceId;

  WiFiClientSecure client;
  String rawResponse;

  template<typename T>
  T safeAssign(T value, T minVal, T maxVal, T defaultVal) {
    return (value >= minVal && value <= maxVal) ? value : defaultVal;
  }

public:
  String wifiSsid;
  String wifiPassword;
  String configuredHost;
  uint16_t configuredPort;
  String sensorEndpoint;
  String cameraEndpoint;

  uint8_t version;
  DynamicIntervals intervals;
  ScheduleHours schedule;
  FanSchedule fanSchedule;
  uint64_t deepSleepIntervalUs;
  String createdAt;
  String updatedAt;

  HttpConfigModule(const char* h, int p, const char* pa, const char* token, const char* id)
    : host(h), port(p), path(pa), deviceToken(token), deviceId(id) {

    client.setInsecure();  // Bỏ xác thực SSL

    wifiSsid = "";
    wifiPassword = "";
    configuredHost = "";
    configuredPort = 0;
    sensorEndpoint = "";
    cameraEndpoint = "";
    version = 0;
    deepSleepIntervalUs = 10ULL * 1000000ULL;

    intervals = {
      5000UL, 5000UL, 60000UL,
      10000UL, 1000UL, 9000UL,
      60000UL, 10000UL, 50000UL
    };

    schedule = { 6, 18, 7, 19 };

    fanSchedule = {
      5000UL, 5000UL, false,
      10000UL, 10000UL
    };
  }

  bool fetchConfig() {
    rawResponse = "";

    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("🚫 [Config] WiFi chưa kết nối");
      return false;
    }

    Serial.printf("📡 [Config] Kết nối HTTPs tới %s:%d (GET %s)\n", host, port, path);

    if (!client.connect(host, port)) {
      Serial.println("❌ [Config] Kết nối HTTPs thất bại");
      return false;
    }

    // Gửi HTTP GET request
    String request = String("GET ") + path + " HTTP/1.1\r\n" +
                     "Host: " + host + "\r\n" +
                     "Content-Type: application/json\r\n" +
                     "x-device-id: " + deviceId + "\r\n" +
                     "x-device-token: " + deviceToken + "\r\n" +
                     "Connection: close\r\n\r\n";

    client.print(request);

    // Đọc response với timeout
    unsigned long timeout = millis();
    while (client.connected() && millis() - timeout < 5000UL) {
      while (client.available()) {
        String line = client.readStringUntil('\n');
        rawResponse += line + "\n";
        timeout = millis();  // reset timeout nếu có data
      }
      delay(10);
    }
    client.stop();

    if (rawResponse.length() == 0) {
      Serial.println("⚠️ [Config] Không nhận được response");
      return false;
    }

    Serial.println("=== RAW RESPONSE ===");
    Serial.println(rawResponse);
    Serial.println("====================");

    int idx = rawResponse.indexOf("\r\n\r\n");
    if (idx < 0 || idx + 4 >= rawResponse.length()) {
      Serial.println("❌ [Config] Không tách được phần body JSON");
      return false;
    }
    String jsonPart = rawResponse.substring(idx + 4);

    DynamicJsonDocument doc(2048);
    DeserializationError err = deserializeJson(doc, jsonPart);
    if (err) {
      Serial.print("❌ [Config] Lỗi parse JSON: ");
      Serial.println(err.f_str());
      return false;
    }

    version = doc["version"] | version;
    wifiSsid = doc["wifiSsid"] | wifiSsid;
    wifiPassword = doc["wifiPassword"] | wifiPassword;
    configuredHost = doc["host"] | configuredHost;
    configuredPort = doc["port"] | configuredPort;
    sensorEndpoint = doc["sensorEndpoint"] | sensorEndpoint;
    cameraEndpoint = doc["cameraEndpoint"] | cameraEndpoint;

    intervals.sensorInterval = safeAssign(doc["sensorInterval"] | intervals.sensorInterval, 1000UL, 600000UL, 5000UL);
    intervals.dataInterval = safeAssign(doc["dataInterval"] | intervals.dataInterval, 1000UL, 600000UL, 5000UL);
    intervals.imageInterval = safeAssign(doc["imageInterval"] | intervals.imageInterval, 10000UL, 3600000UL, 60000UL);
    intervals.pumpCycleMs = safeAssign(doc["pumpCycleMs"] | intervals.pumpCycleMs, 1000UL, 3600000UL, 10000UL);
    intervals.pumpOnMs = safeAssign(doc["pumpOnMs"] | intervals.pumpOnMs, 100UL, intervals.pumpCycleMs, 1000UL);
    intervals.pumpOffMs = safeAssign(doc["pumpOffMs"] | intervals.pumpOffMs, 100UL, intervals.pumpCycleMs, 9000UL);
    intervals.ledCycleMs = safeAssign(doc["ledCycleMs"] | intervals.ledCycleMs, 1000UL, 86400000UL, 60000UL);
    intervals.ledOnMs = safeAssign(doc["ledOnMs"] | intervals.ledOnMs, 100UL, intervals.ledCycleMs, 10000UL);
    intervals.ledOffMs = safeAssign(doc["ledOffMs"] | intervals.ledOffMs, 100UL, intervals.ledCycleMs, 50000UL);

    schedule.pumpStartHour = safeAssign<int>((int)(doc["pumpStartHour"] | schedule.pumpStartHour), 0, 23, 6);
    schedule.pumpEndHour = safeAssign<int>((int)(doc["pumpEndHour"] | schedule.pumpEndHour), 0, 23, 18);
    schedule.ledStartHour = safeAssign<int>((int)(doc["ledStartHour"] | schedule.ledStartHour), 0, 23, 7);
    schedule.ledEndHour = safeAssign<int>((int)(doc["ledEndHour"] | schedule.ledEndHour), 0, 23, 19);

    fanSchedule.smallOnMs = safeAssign(doc["fanSmallOnMs"] | fanSchedule.smallOnMs, 100UL, 3600000UL, 5000UL);
    fanSchedule.smallOffMs = safeAssign(doc["fanSmallOffMs"] | fanSchedule.smallOffMs, 100UL, 3600000UL, 5000UL);
    if (doc.containsKey("fanLargeMode")) {
      fanSchedule.largeContinuous = String(doc["fanLargeMode"].as<const char*>()) == "continuous";
    }
    fanSchedule.largeOnMs = safeAssign(doc["fanLargeOnMs"] | fanSchedule.largeOnMs, 100UL, 3600000UL, 10000UL);
    fanSchedule.largeOffMs = safeAssign(doc["fanLargeOffMs"] | fanSchedule.largeOffMs, 100UL, 3600000UL, 10000UL);

    if (doc["deepSleepIntervalUs"].is<uint64_t>()) {
      uint64_t val = doc["deepSleepIntervalUs"];
      deepSleepIntervalUs = (val >= 1000000ULL && val <= 86400000000ULL) ? val : 10ULL * 1000000ULL;
    } else if (doc["deepSleepIntervalUs"].is<const char*>()) {
      const char* str = doc["deepSleepIntervalUs"];
      if (str) {
        uint64_t val = strtoull(str, nullptr, 10);
        deepSleepIntervalUs = (val >= 1000000ULL && val <= 86400000000ULL) ? val : 10ULL * 1000000ULL;
      }
    }

    createdAt = doc["createdAt"] | createdAt;
    updatedAt = doc["updatedAt"] | updatedAt;

    Serial.println("✅ [Config] Đã tải và lưu cấu hình:");
    Serial.printf("  SSID: %s\n", wifiSsid.c_str());
    Serial.printf("  Host: %s:%u\n", configuredHost.c_str(), configuredPort);
    Serial.printf("  Sensor endpoint: %s\n", sensorEndpoint.c_str());

    return true;
  }
};

#endif  // HTTP_CONFIG_MODULE_H
