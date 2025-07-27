#ifndef MQTT_MODULE_H
#define MQTT_MODULE_H

#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <functional>
#include "config.h"
#include <ArduinoJson.h>

#ifndef MQTT_CALLBACK_SIGNATURE
#define MQTT_CALLBACK_SIGNATURE std::function<void(char*, uint8_t*, unsigned int)> callback
#endif

class MQTTModule {
public:
  MQTTModule()
    : client(secureClient) {}

  // Khởi tạo MQTT với host mặc định
  void begin(MQTT_CALLBACK_SIGNATURE) {
    secureClient.setInsecure();
    client.setServer(MQTT_HOST, MQTT_PORT);
    client.setCallback(callback);
  }

  // Hoặc khởi tạo với host tùy chọn
  void begin(const char* host, int port, MQTT_CALLBACK_SIGNATURE) {
    secureClient.setInsecure();
    client.setServer(host, port);
    client.setCallback(callback);
  }

  void loop() {
    if (!client.connected()) {
      reconnect();
    }
    client.loop();
  }

  // Publish thường
  bool publish(const char* topic, const char* payload) {
    if (client.connected()) {
      return client.publish(topic, payload);
    }
    return false;
  }

  bool publish(const char* topic, const char* payload, size_t length) {
    if (client.connected()) {
      return client.publish(topic, payload, length);
    }
    return false;
  }

  bool publishBinary(const char* topic, const uint8_t* payload, size_t length) {
    if (client.connected()) {
      return client.publish(topic, payload, length);
    }
    return false;
  }

  void publishScreenState(bool pumpOn, bool ledOn, bool fanOn) {
    StaticJsonDocument<256> doc;
    doc["pumpOn"] = pumpOn;
    doc["ledOn"] = ledOn;
    doc["fanOn"] = fanOn;

    char buffer[256];
    serializeJson(doc, buffer);
    publish("esp32/screen", buffer);
  }

  void publishSensorData(float waterTemp, float envTemp, float envHum) {
    StaticJsonDocument<128> doc;
    doc["waterTemperature"] = roundf(waterTemp * 10) / 10;
    doc["ambientTemperature"] = roundf(envTemp * 10) / 10;
    doc["humidity"] = roundf(envHum * 10) / 10;

    char buffer[128];
    size_t len = serializeJson(doc, buffer);
    publish("esp32/sensors", buffer, len);
  }

  void publishCameraImageBase64(const char* base64Image) {
    if (!client.connected()) return;

    size_t totalLen = strlen(base64Image);

    // Tạo JSON với mảng images chứa base64 và size
    StaticJsonDocument<30000> doc;  // Tùy theo độ dài ảnh base64
    JsonArray images = doc.createNestedArray("images");

    JsonObject image = images.createNestedObject();
    image["filePath"] = base64Image;
    image["size"] = totalLen;

    char buffer[30000];
    size_t len = serializeJson(doc, buffer);
    publish("esp32/camera", buffer, len);
  }


  void publishError(const char* errorMsg) {
    publish("esp32/errors", errorMsg);
  }

  // Subscriptions
  void subscribeAll() {
    client.subscribe("esp32/screen");
    client.subscribe("esp32/sensors");
    client.subscribe("esp32/camera");
    client.subscribe("esp32/errors");
  }

  void subscribe(const char* topic) {
    client.subscribe(topic);
  }

  void setCallback(MQTT_CALLBACK_SIGNATURE) {
    client.setCallback(callback);
  }

private:
  WiFiClientSecure secureClient;
  PubSubClient client;

  void reconnect() {
    while (!client.connected()) {
      Serial.print("Đang kết nối MQTT...");
      if (client.connect("ESP32Client", MQTT_USER, MQTT_PASS)) {
        Serial.println("✅ Thành công");
        subscribeAll();
      } else {
        Serial.print("❌ Lỗi: ");
        Serial.print(client.state());
        Serial.println(" => thử lại sau 5 giây");
        delay(5000);
      }
    }
  }
};

#endif  // MQTT_MODULE_H
