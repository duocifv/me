#ifndef HTTP_CONFIG_MODULE_H
#define HTTP_CONFIG_MODULE_H

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

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
  bool     largeContinuous;
  uint32_t largeOnMs;
  uint32_t largeOffMs;
};

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
    client.setInsecure();
    wifiSsid = "";
    wifiPassword = "";
    configuredHost = "";
    configuredPort = 0;
    sensorEndpoint = "";
    cameraEndpoint = "";
    deepSleepIntervalUs = 10ULL * 1000000ULL;
    version = 0;

    intervals = {
      .sensorInterval = 5000UL,
      .dataInterval   = 5000UL,
      .imageInterval  = 60000UL,
      .pumpCycleMs    = 10000UL,
      .pumpOnMs       = 1000UL,
      .pumpOffMs      = 9000UL,
      .ledCycleMs     = 60000UL,
      .ledOnMs        = 10000UL,
      .ledOffMs       = 50000UL,
    };

    schedule = {
      .pumpStartHour = static_cast<uint8_t>(6),
      .pumpEndHour   = static_cast<uint8_t>(18),
      .ledStartHour  = static_cast<uint8_t>(7),
      .ledEndHour    = static_cast<uint8_t>(19),
    };

    fanSchedule = {
      .smallOnMs        = 5000UL,
      .smallOffMs       = 5000UL,
      .largeContinuous  = false,
      .largeOnMs        = 10000UL,
      .largeOffMs       = 10000UL,
    };
  }

  bool fetchConfig() {
    rawResponse = "";

    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("🚫 [Config] WiFi chưa kết nối");
      return false;
    }

    Serial.printf("🛠 [Config] Kết nối SSL tới %s:%d (GET %s)\n", host, port, path);
    if (!client.connect(host, port)) {
      Serial.println("❌ [Config] Kết nối SSL thất bại");
      return false;
    }

    String request = String("GET ") + path + " HTTP/1.1\r\n" +
                     "Host: " + host + "\r\n" +
                     "Content-Type: application/json\r\n" +
                     "x-device-id: " + String(deviceId) + "\r\n" +
                     "x-device-token: " + String(deviceToken) + "\r\n" +
                     "Connection: close\r\n\r\n";

    client.print(request);

    unsigned long timeout = millis();
    while (client.connected() && millis() - timeout < 5000UL) {
      while (client.available()) {
        rawResponse += client.readStringUntil('\n') + "\n";
        timeout = millis();
      }
      delay(10);
    }
    client.stop();

    if (rawResponse.length() == 0) {
      Serial.println("⚠️ [Config] Không nhận được response");
      return false;
    }

    int idx = rawResponse.indexOf("\r\n\r\n");
    if (idx < 0) {
      Serial.println("❌ [Config] Không tách được phần body JSON");
      return false;
    }
    String jsonPart = rawResponse.substring(idx + 4);

    StaticJsonDocument<3072> doc;
    DeserializationError err = deserializeJson(doc, jsonPart);
    if (err) {
      Serial.print("❌ [Config] Lỗi parse JSON: ");
      Serial.println(err.f_str());
      return false;
    }

    if (doc.containsKey("version"))
      version = doc["version"].as<uint8_t>();
    if (doc.containsKey("wifiSsid"))
      wifiSsid = doc["wifiSsid"].as<const char*>();
    if (doc.containsKey("wifiPassword"))
      wifiPassword = doc["wifiPassword"].as<const char*>();
    if (doc.containsKey("host"))
      configuredHost = doc["host"].as<const char*>();
    if (doc.containsKey("port"))
      configuredPort = doc["port"].as<uint16_t>();
    if (doc.containsKey("sensorEndpoint"))
      sensorEndpoint = doc["sensorEndpoint"].as<const char*>();
    if (doc.containsKey("cameraEndpoint"))
      cameraEndpoint = doc["cameraEndpoint"].as<const char*>();

    if (doc.containsKey("sensorInterval"))
      intervals.sensorInterval = safeAssign(doc["sensorInterval"].as<uint32_t>(), 1000UL, 600000UL, 5000UL);
    if (doc.containsKey("dataInterval"))
      intervals.dataInterval = safeAssign(doc["dataInterval"].as<uint32_t>(), 1000UL, 600000UL, 5000UL);
    if (doc.containsKey("imageInterval"))
      intervals.imageInterval = safeAssign(doc["imageInterval"].as<uint32_t>(), 10000UL, 3600000UL, 60000UL);
    if (doc.containsKey("pumpCycleMs"))
      intervals.pumpCycleMs = safeAssign(doc["pumpCycleMs"].as<uint32_t>(), 1000UL, 3600000UL, 10000UL);
    if (doc.containsKey("pumpOnMs"))
      intervals.pumpOnMs = safeAssign(doc["pumpOnMs"].as<uint32_t>(), 100UL, intervals.pumpCycleMs, 1000UL);
    if (doc.containsKey("pumpOffMs"))
      intervals.pumpOffMs = safeAssign(doc["pumpOffMs"].as<uint32_t>(), 100UL, intervals.pumpCycleMs, 9000UL);
    if (doc.containsKey("ledCycleMs"))
      intervals.ledCycleMs = safeAssign(doc["ledCycleMs"].as<uint32_t>(), 1000UL, 86400000UL, 60000UL);
    if (doc.containsKey("ledOnMs"))
      intervals.ledOnMs = safeAssign(doc["ledOnMs"].as<uint32_t>(), 100UL, intervals.ledCycleMs, 10000UL);
    if (doc.containsKey("ledOffMs"))
      intervals.ledOffMs = safeAssign(doc["ledOffMs"].as<uint32_t>(), 100UL, intervals.ledCycleMs, 50000UL);

    if (doc.containsKey("pumpStartHour"))
      schedule.pumpStartHour = safeAssign(doc["pumpStartHour"].as<uint8_t>(), static_cast<uint8_t>(0), static_cast<uint8_t>(23), static_cast<uint8_t>(6));
    if (doc.containsKey("pumpEndHour"))
      schedule.pumpEndHour   = safeAssign(doc["pumpEndHour"].as<uint8_t>(), static_cast<uint8_t>(0), static_cast<uint8_t>(23), static_cast<uint8_t>(18));
    if (doc.containsKey("ledStartHour"))
      schedule.ledStartHour  = safeAssign(doc["ledStartHour"].as<uint8_t>(), static_cast<uint8_t>(0), static_cast<uint8_t>(23), static_cast<uint8_t>(7));
    if (doc.containsKey("ledEndHour"))
      schedule.ledEndHour    = safeAssign(doc["ledEndHour"].as<uint8_t>(), static_cast<uint8_t>(0), static_cast<uint8_t>(23), static_cast<uint8_t>(19));

    if (doc.containsKey("fanSmallOnMs"))
      fanSchedule.smallOnMs   = safeAssign(doc["fanSmallOnMs"].as<uint32_t>(), 100UL, 3600000UL, 5000UL);
    if (doc.containsKey("fanSmallOffMs"))
      fanSchedule.smallOffMs  = safeAssign(doc["fanSmallOffMs"].as<uint32_t>(), 100UL, 3600000UL, 5000UL);
    if (doc.containsKey("fanLargeMode"))
      fanSchedule.largeContinuous = String(doc["fanLargeMode"].as<const char*>()) == "continuous";
    if (doc.containsKey("fanLargeOnMs"))
      fanSchedule.largeOnMs   = safeAssign(doc["fanLargeOnMs"].as<uint32_t>(), 100UL, 3600000UL, 10000UL);
    if (doc.containsKey("fanLargeOffMs"))
      fanSchedule.largeOffMs  = safeAssign(doc["fanLargeOffMs"].as<uint32_t>(), 100UL, 3600000UL, 10000UL);

    if (doc.containsKey("deepSleepIntervalUs")) {
      uint64_t val = strtoull(doc["deepSleepIntervalUs"], nullptr, 10);
      deepSleepIntervalUs = (val >= 1000000ULL && val <= 24ULL * 3600ULL * 1000000ULL)
                          ? val : 10ULL * 1000000ULL;
    }

    if (doc.containsKey("createdAt")) createdAt = doc["createdAt"].as<const char*>();
    if (doc.containsKey("updatedAt")) updatedAt = doc["updatedAt"].as<const char*>();


   Serial.println("✅ [Config] Đã parse và lưu cấu hình:");
    Serial.printf("  wifiSsid: %s\n", wifiSsid.c_str());
    Serial.printf("  wifiPassword: %s\n", wifiPassword.c_str());
    Serial.printf("  host: %s\n", configuredHost.c_str());
    Serial.printf("  port: %u\n", configuredPort);
    Serial.printf("  sensorEndpoint: %s\n", sensorEndpoint.c_str());
    Serial.printf("  cameraEndpoint: %s\n", cameraEndpoint.c_str());
    Serial.printf("  sensorInterval: %u ms\n", intervals.sensorInterval);
    Serial.printf("  dataInterval: %u ms\n", intervals.dataInterval);
    Serial.printf("  imageInterval: %u ms\n", intervals.imageInterval);
    Serial.printf("  pumpCycleMs: %u ms\n", intervals.pumpCycleMs);
    Serial.printf("  pumpOnMs: %u ms\n", intervals.pumpOnMs);
    Serial.printf("  ledCycleMs: %u ms\n", intervals.ledCycleMs);
    Serial.printf("  ledOnMs: %u ms\n", intervals.ledOnMs);
    Serial.printf("  pumpStartHour: %u\n", schedule.pumpStartHour);
    Serial.printf("  pumpEndHour: %u\n", schedule.pumpEndHour);
    Serial.printf("  ledStartHour: %u\n", schedule.ledStartHour);
    Serial.printf("  ledEndHour: %u\n", schedule.ledEndHour);
    Serial.printf("  deepSleepIntervalUs: %llu us\n", deepSleepIntervalUs);
    Serial.printf("  createdAt: %s\n", createdAt.c_str());
    Serial.printf("  updatedAt: %s\n", updatedAt.c_str());
    return true;
  }

  const String& getRawResponse() const {
    return rawResponse;
  }
};

#endif // HTTP_CONFIG_MODULE_H
