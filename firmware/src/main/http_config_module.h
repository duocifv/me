#ifndef HTTP_CONFIG_MODULE_H
#define HTTP_CONFIG_MODULE_H

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// ==== CẤU TRÚC TRẠNG THÁI THIẾT BỊ ====

struct DevicesState
{
  bool pump;
  bool led;
  bool fan;
};

// ==== CLASS CHÍNH ====

class HttpConfigModule
{
private:
  const char *host;
  const int port;
  const char *path;
  const char *deviceToken;
  const char *deviceId;

  WiFiClientSecure client;
  String rawResponse;

public:
  String configuredHost;
  uint16_t configuredPort;
  String sensorEndpoint;
  String cameraEndpoint;

  uint8_t version;
  DevicesState devices;
  uint32_t dataInterval;  // ms
  uint32_t imageInterval; // ms
  String createdAt;
  String updatedAt;

  HttpConfigModule(const char *h, int p, const char *pa, const char *token, const char *id)
      : host(h), port(p), path(pa), deviceToken(token), deviceId(id)
  {
    client.setInsecure(); // Bỏ xác thực SSL

    configuredHost = "";
    configuredPort = 0;
    sensorEndpoint = "";
    cameraEndpoint = "";
    version = 0;
    dataInterval = 15000UL;
    imageInterval = 20000UL;
    devices = {false, false, false};
  }

  bool fetchConfig()
  {
    rawResponse = "";

    if (WiFi.status() != WL_CONNECTED)
    {
      Serial.println("🚫 [Config] WiFi chưa kết nối");
      return false;
    }

    Serial.printf("📡 [Config] Kết nối HTTPs tới %s:%d (GET %s)\n", host, port, path);

    if (!client.connect(host, port))
    {
      Serial.println("❌ [Config] Kết nối HTTPs thất bại");
      return false;
    }

    String request = String("GET ") + path + " HTTP/1.1\r\n" +
                     "Host: " + host + "\r\n" +
                     "Content-Type: application/json\r\n" +
                     "x-device-id: " + deviceId + "\r\n" +
                     "x-device-token: " + deviceToken + "\r\n" +
                     "Connection: close\r\n\r\n";

    client.print(request);

    unsigned long timeout = millis();
    while (client.connected() && millis() - timeout < 5000UL)
    {
      while (client.available())
      {
        String line = client.readStringUntil('\n');
        rawResponse += line + "\n";
        timeout = millis(); // reset timeout nếu có data
      }
      delay(10);
    }
    client.stop();

    if (rawResponse.length() == 0)
    {
      Serial.println("⚠️ [Config] Không nhận được response");
      return false;
    }

    Serial.println("=== RAW RESPONSE ===");
    Serial.println(rawResponse);
    Serial.println("====================");

    int idx = rawResponse.indexOf("\r\n\r\n");
    if (idx < 0 || idx + 4 >= rawResponse.length())
    {
      Serial.println("❌ [Config] Không tách được phần body JSON");
      return false;
    }
    String jsonPart = rawResponse.substring(idx + 4);

    DynamicJsonDocument doc(1024);
    DeserializationError err = deserializeJson(doc, jsonPart);
    if (err)
    {
      Serial.print("❌ [Config] Lỗi parse JSON: ");
      Serial.println(err.f_str());
      return false;
    }

    version = doc["version"] | version;
    configuredHost = doc["host"] | configuredHost;
    configuredPort = doc["port"] | configuredPort;
    sensorEndpoint = doc["sensorEndpoint"] | sensorEndpoint;
    cameraEndpoint = doc["cameraEndpoint"] | cameraEndpoint;

    dataInterval = (doc["dataInterval"] | (dataInterval / 1000UL)) * 1000UL;
    imageInterval = (doc["imageInterval"] | (imageInterval / 1000UL)) * 1000UL;

    devices.pump = doc["pumpOn"] | false;
    devices.led = doc["ledOn"] | false;
    devices.fan = doc["fanOn"] | false;

    createdAt = doc["createdAt"] | createdAt;
    updatedAt = doc["updatedAt"] | updatedAt;

    Serial.println("✅ [Config] Đã tải và lưu cấu hình:");
    Serial.printf("  Host: %s:%u\n", configuredHost.c_str(), configuredPort);
    Serial.printf("  Sensor endpoint: %s\n", sensorEndpoint.c_str());
    Serial.printf("  Devices: pump=%d, led=%d, fan=%d\n", devices.pump, devices.led, devices.fan);

    return true;
  }
};

#endif // HTTP_CONFIG_MODULE_H
