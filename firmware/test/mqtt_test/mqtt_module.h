#ifndef MQTT_MODULE_H
#define MQTT_MODULE_H

#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <functional>
#include "config.h"
#include <ArduinoJson.h>

class MQTTModule
{
public:
    MQTTModule()
        : client(secureClient) {}

    // Khởi tạo MQTT với host mặc định
    void begin(std::function<void(char *, uint8_t *, unsigned int)> userCallback)
    {
        callbackFunc = userCallback;
        secureClient.setInsecure(); // ⚠️ Dùng thử nghiệm, không nên trong sản phẩm thực tế
        client.setServer(MQTT_HOST, MQTT_PORT);
        client.setCallback(callbackFunc);
    }

    // Hoặc khởi tạo với host tùy chọn
    void begin(const char *host, int port, std::function<void(char *, uint8_t *, unsigned int)> userCallback)
    {
        callbackFunc = userCallback;
        secureClient.setInsecure();
        client.setServer(host, port);
        client.setCallback(callbackFunc);
    }

    void loop()
    {
        if (!client.connected())
        {
            reconnect();
        }
        client.loop();
    }

    bool publish(const char *topic, const char *payload)
    {
        if (client.connected())
        {
            return client.publish(topic, payload);
        }
        return false;
    }

    bool publish(const char *topic, const char *payload, size_t length)
    {
        if (client.connected())
        {
            return client.publish(topic, payload, length);
        }
        return false;
    }

    void subscribe(const char *topic)
    {
        client.subscribe(topic);
    }

    bool publishBinary(const char *topic, const uint8_t *payload, size_t length)
    {
        if (client.connected())
        {
            return client.publish(topic, payload, length);
        }
        return false;
    }

    void publishScreenState(bool pumpOn, bool ledOn, bool fanOn)
    {
        StaticJsonDocument<128> doc;
        doc["pumpOn"] = pumpOn;
        doc["ledOn"] = ledOn;
        doc["fanOn"] = fanOn;

        char buffer[256];
        serializeJson(doc, buffer);
        publish("esp32/control", buffer);
    }

    void publishSensorData(float waterTemp, float envTemp, float envHum)
    {
        StaticJsonDocument<128> doc;
        doc["waterTemperature"] = roundf(waterTemp * 10) / 10;
        doc["ambientTemperature"] = roundf(envTemp * 10) / 10;
        doc["humidity"] = roundf(envHum * 10) / 10;

        char buffer[128];
        size_t len = serializeJson(doc, buffer);
        publish("esp32/sensors", buffer, len);
    }

    void publishCameraImageBase64(const char *base64Image)
    {
        if (!client.connected())
            return;

        const size_t chunkSize = 120;
        size_t totalLen = strlen(base64Image);
        size_t totalChunks = (totalLen + chunkSize - 1) / chunkSize;

        // ID duy nhất cho ảnh này (timestamp millis)
        unsigned long imageId = millis();

        char buffer[200]; // buffer cho gói JSON, vừa đủ để tránh tràn

        for (size_t i = 0; i < totalChunks; i++)
        {
            size_t start = i * chunkSize;
            size_t len = min(chunkSize, totalLen - start);

            DynamicJsonDocument doc(200);
            doc["id"] = imageId;
            doc["index"] = i;
            doc["total"] = totalChunks;

            // Sao chép đoạn dữ liệu base64 vào chuỗi con
            String chunk = "";
            for (size_t j = 0; j < len; j++)
            {
                chunk += base64Image[start + j];
            }
            doc["data"] = chunk;

            size_t jsonLen = serializeJson(doc, buffer);
            // Serial.printf("📤 Chunk %d/%d sent (%d bytes)\n", i + 1, totalChunks, jsonLen);
            // Serial.println(chunk);
            publish("esp32/camera", buffer, jsonLen);

            delay(500); // nhỏ để tránh quá tải mạng hoặc broker
        }

        Serial.printf("✅ Base64 image sent in %d chunks (chunkSize: %d)\n", totalChunks, chunkSize);
    }

    void publishError(const char *errorMsg)
    {
        DynamicJsonDocument doc(256);
        doc["message"] = errorMsg;
        doc["timestamp"] = millis();
        char buffer[256];
        size_t len = serializeJson(doc, buffer);
        publish("esp32/errors", buffer, len);
    }

private:
    WiFiClientSecure secureClient;
    PubSubClient client;
    std::function<void(char *, uint8_t *, unsigned int)> callbackFunc;

    void reconnect()
    {
        while (!client.connected())
        {
            Serial.print("🔌 MQTT connecting...");
            if (client.connect("ESP32Client", MQTT_USER, MQTT_PASS))
            {
                Serial.println("✅ Connected");
                client.subscribe("esp32/control");
                Serial.println("📡 Subscribed to: esp32/control");
            }
            else
            {
                Serial.print("❌ Failed, rc=");
                Serial.print(client.state());
                Serial.println(" => retrying in 5s");
                delay(5000);
            }
        }
    }
};

#endif // MQTT_MODULE_H
