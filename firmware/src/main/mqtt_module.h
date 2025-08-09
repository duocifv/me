#ifndef MQTT_MODULE_H
#define MQTT_MODULE_H

#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <functional>
#include <ArduinoJson.h>
#include "config.h"

class MQTTModule {
public:
  MQTTModule()
    : client(secureClient) {}

  void begin(std::function<void(char *, uint8_t *, unsigned int)> userCallback) {
    callbackFunc = std::move(userCallback);
    secureClient.setInsecure();
    client.setServer(MQTT_HOST, MQTT_PORT);
    client.setCallback(callbackFunc);
  }

  void begin(const char *host, int port, std::function<void(char *, uint8_t *, unsigned int)> userCallback) {
    callbackFunc = std::move(userCallback);
    secureClient.setInsecure();
    client.setServer(host, port);
    client.setCallback(callbackFunc);
  }

  void loop() {
    unsigned long now = millis();

    if (!client.connected()) {
      if (now - lastReconnectAttempt > reconnectInterval) {
        lastReconnectAttempt = now;
        reconnect();
      }
    } else {
      client.loop();

      
    }
  }

  bool publish(const char *topic, const char *payload) {
    return client.connected() && client.publish(topic, payload);
  }

  bool publish(const char *topic, const char *payload, size_t length) {
    return client.connected() && client.publish(topic, payload, length);
  }

  void subscribe(const char *topic) {
    if (client.connected()) {
      client.subscribe(topic);
    }
  }

  bool publishBinary(const char *topic, const uint8_t *payload, size_t length) {
    return client.connected() && client.publish(topic, payload, length);
  }

  void publishScreenState(bool pumpOn, bool ledOn, bool fanOn) {
    StaticJsonDocument<128> doc;
    doc["pumpOn"] = pumpOn;
    doc["ledOn"] = ledOn;
    doc["fanOn"] = fanOn;
    char buf[128];
    size_t len = serializeJson(doc, buf);
    publish("esp32/control", buf, len);
  }

  void publishSensorData(float waterTemp, float envTemp, float envHum) {
    StaticJsonDocument<128> doc;
    doc["waterTemperature"] = roundf(waterTemp * 10) / 10;
    doc["ambientTemperature"] = roundf(envTemp * 10) / 10;
    doc["humidity"] = roundf(envHum * 10) / 10;
    char buf[128];
    size_t len = serializeJson(doc, buf);
    publish("esp32/sensors", buf, len);
  }

  bool publishCameraImageBase64(const char *base64Image) {
    if (!client.connected())
      return false;

    const size_t chunkSize = 120;
    size_t totalLen = strlen(base64Image);
    size_t totalChunks = (totalLen + chunkSize - 1) / chunkSize;
    unsigned long imageId = millis();

    char chunkBuf[chunkSize + 1];
    char jsonBuf[300];
    StaticJsonDocument<400> doc;

    for (size_t i = 0; i < totalChunks; ++i) {
      size_t start = i * chunkSize;
      size_t len = min(chunkSize, totalLen - start);


      memcpy(chunkBuf, base64Image + start, len);
      chunkBuf[len] = '\0';

      doc.clear();
      doc["id"] = imageId;
      doc["index"] = i;
      doc["total"] = totalChunks;
      doc["data"] = chunkBuf;


      size_t n = serializeJson(doc, jsonBuf);
      if (!client.publish("esp32/camera", jsonBuf, n)) {
        return false;
      }
      delay(100);
    }
    return true;
  }

  void publishError(const char *errorMsg) {
    StaticJsonDocument<256> doc;
    doc["message"] = errorMsg;
    char buf[256];
    size_t len = serializeJson(doc, buf);
    publish("esp32/errors", buf, len);
  }

  void publishPing() {
    publish("esp32/ping", "1");
  }

private:
  WiFiClientSecure secureClient;
  PubSubClient client;
  std::function<void(char *, uint8_t *, unsigned int)> callbackFunc;

  unsigned long lastReconnectAttempt = 0;
  const unsigned long reconnectInterval = 5000;

  unsigned long lastPingTime = 0;
  const unsigned long pingInterval = 10000;  // Gửi ping mỗi 10 giây

  void reconnect() {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("⚠️ WiFi chưa sẵn sàng, bỏ qua MQTT reconnect.");
      return;
    }

    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);  // 👈 tạo clientId ngẫu nhiên

    if (client.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
      Serial.println("✅ MQTT Connected!");
      client.subscribe("esp32/control");
      Serial.println("📡 Subscribed to: esp32/control");

      // Gửi tín hiệu báo online
      publish("esp32/health", "on");
    } else {
      Serial.print("❌ MQTT Failed, rc=");
      Serial.println(client.state());
    }
  }
};

#endif  // MQTT_MODULE_H
