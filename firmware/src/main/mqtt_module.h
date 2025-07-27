#ifndef MQTT_MODULE_H
#define MQTT_MODULE_H

#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <functional>
#include "config.h"

#ifndef MQTT_CALLBACK_SIGNATURE
  #define MQTT_CALLBACK_SIGNATURE std::function<void(char*, uint8_t*, unsigned int)> callback
#endif

class MQTTModule {
  public:
    MQTTModule() : client(secureClient) {}

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
    void publish(const char* topic, const char* payload) {
      if (client.connected()) {
        client.publish(topic, payload);
      }
    }

    void publish(const char* topic, const char* payload, size_t length) {
      if (client.connected()) {
        client.publish(topic, payload, length);
      }
    }

    void publishBinary(const char* topic, const uint8_t* payload, size_t length) {
      if (client.connected()) {
        client.publish(topic, payload, length);
      }
    }

    // Publish hỗ trợ nội dung cụ thể
    void publishScreenState(bool pumpOn, bool ledOn, bool fanOn) {
      String payload = "{\"pumpOn\":" + String(pumpOn ? "true" : "false");
      payload += ",\"ledOn\":" + String(ledOn ? "true" : "false");
      payload += ",\"fanOn\":" + String(fanOn ? "true" : "false") + "}";
      publish("esp32/screen", payload.c_str());
    }

    void publishSensorData(float waterTemp, float envTemp, float envHum) {
      String payload = "{\"waterTemp\":" + String(waterTemp, 1);
      payload += ",\"envTemp\":" + String(envTemp, 1);
      payload += ",\"envHum\":" + String(envHum, 1) + "}";
      publish("esp32/sensors", payload.c_str());
    }

    void publishCameraImageBase64(const char* base64Image) {
      publish("esp32/camera", base64Image);
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

#endif // MQTT_MODULE_H
