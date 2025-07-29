#ifndef MQTT_MODULE_H
#define MQTT_MODULE_H

#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <functional>
#include <ArduinoJson.h>
#include "config.h"

class MQTTModule {
public:
    MQTTModule() : client(secureClient) {}

    // Khởi tạo MQTT với callback
    void begin(std::function<void(char*, uint8_t*, unsigned int)> userCallback) {
        callbackFunc = std::move(userCallback);
        secureClient.setInsecure();  // Chỉ dùng thử nghiệm
        client.setServer(MQTT_HOST, MQTT_PORT);
        client.setCallback(callbackFunc);
    }

    // Hoặc khởi tạo với host tùy chọn
    void begin(const char* host, int port, std::function<void(char*, uint8_t*, unsigned int)> userCallback) {
        callbackFunc = std::move(userCallback);
        secureClient.setInsecure();
        client.setServer(host, port);
        client.setCallback(callbackFunc);
    }

    void loop() {
        if (!client.connected()) reconnect();
        client.loop();
    }

    bool publish(const char* topic, const char* payload) {
        return client.connected() && client.publish(topic, payload);
    }

    bool publish(const char* topic, const char* payload, size_t length) {
        return client.connected() && client.publish(topic, payload, length);
    }

    void subscribe(const char* topic) {
        if (client.connected()) {
            client.subscribe(topic);
        }
    }

    bool publishBinary(const char* topic, const uint8_t* payload, size_t length) {
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

    // Gửi ảnh Base64 chia chunk để tránh quá tải
    bool publishCameraImageBase64(const char* base64Image) {
        if (!client.connected()) return false;

        const size_t chunkSize = 120;
        size_t totalLen = strlen(base64Image);
        size_t totalChunks = (totalLen + chunkSize - 1) / chunkSize;
        unsigned long imageId = millis();

        char chunkBuf[chunkSize + 1];
        char jsonBuf[256];
        StaticJsonDocument<512> doc;

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
            delay(200);
        }
        return true;
    }

    void publishError(const char* errorMsg) {
        StaticJsonDocument<256> doc;
        doc["message"] = errorMsg;
        doc["timestamp"] = millis();
        char buf[256];
        size_t len = serializeJson(doc, buf);
        publish("esp32/errors", buf, len);
    }

private:
    WiFiClientSecure secureClient;
    PubSubClient client;
    std::function<void(char*, uint8_t*, unsigned int)> callbackFunc;

    void reconnect() {
        while (!client.connected()) {
            Serial.print("🔌 MQTT connecting...");
            if (client.connect("ESP32Client", MQTT_USER, MQTT_PASS)) {
                Serial.println("✅ Connected");
                client.subscribe("esp32/control");
                Serial.println("📡 Subscribed to: esp32/control");
            } else {
                Serial.print("❌ Failed, rc=");
                Serial.print(client.state());
                Serial.println(" => retrying in 5s");
                delay(5000);
            }
        }
    }
};

#endif // MQTT_MODULE_H
