#ifndef MQTT_MODULE_H
#define MQTT_MODULE_H

#include <Arduino.h>
#include <WiFiClientSecureBearSSL.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "config.h"

class MQTTModule {
public:
  MQTTModule()
    : _client(_secureClient) {}

  void begin(std::function<void(char *, uint8_t *, unsigned int)> cb) {
    _secureClient.setInsecure();  // ⚠️ chỉ để test, production nên dùng CA
    _client.setServer(MQTT_HOST, MQTT_PORT);
    _client.setCallback([cb](char *t, byte *p, unsigned int l) {
      cb(t, p, l);
    });
    _client.setBufferSize(512);
  }

  void loop() {
    if (!_client.connected()) {
      unsigned long now = millis();
      if (now - _lastReconnect >= 5000) {
        _lastReconnect = now;
        reconnect();
      }
    } else {
      _client.loop();
    }
  }

  void publishPing() {
    publish("esp32/ping", "1");
  }

  void publishError(const char *msg) {
    StaticJsonDocument<128> doc;
    doc["message"] = msg;
    char buf[128];
    size_t len = serializeJson(doc, buf);
    publish("esp32/errors", buf, len);
  }


  bool isConnected() {
    return _client.connected();
  }


  bool publishSensor(float waterTemp, float airTemp, float humidity) {
    if (!_client.connected()) return false;

    StaticJsonDocument<192> doc;
    doc["waterTemp"] = isnan(waterTemp) ? 0 : waterTemp;
    doc["airTemp"] = isnan(airTemp) ? 0 : airTemp;
    doc["humidity"] = isnan(humidity) ? 0 : humidity;

    char buf[192];
    size_t n = serializeJson(doc, buf);
    return _client.publish("esp32/sensors", buf, n);
  }


private:
  BearSSL::WiFiClientSecure _secureClient;
  PubSubClient _client;
  unsigned long _lastReconnect = 0;

  void reconnect() {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("⚠️ WiFi not ready, skip MQTT reconnect.");
      return;
    }

    String clientId = "ESP32-" + String(random(0xffff), HEX);
    if (_client.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
      Serial.println("✅ MQTT Connected!");
      _client.subscribe("esp32/control");
      Serial.println("📡 Subscribed to: esp32/control");

      // Báo online
      _client.publish("esp32/health", "on");
    } else {
      Serial.printf("❌ MQTT Failed, rc=%d\n", _client.state());
    }
  }

  void publish(const char *topic, const char *payload) {
    if (_client.connected()) {
      _client.publish(topic, payload);
    }
  }

  void publish(const char *topic, const char *payload, size_t len) {
    if (_client.connected()) {
      _client.publish(topic, payload, len);
    }
  }
};

#endif  // MQTT_MODULE_H
