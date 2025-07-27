#ifndef MQTT_MODULE_H
#define MQTT_MODULE_H

#include <PubSubClient.h>
#include <WiFi.h>

class MQTTModule {
private:
    WiFiClient espClient;
    PubSubClient client;

public:
    MQTTModule() : client(espClient) {}

    void begin(const char* server, int port, MQTT_CALLBACK_SIGNATURE) {
        client.setServer(server, port);
        client.setCallback(callback);
        reconnect();
    }

    void reconnect() {
        while (!client.connected()) {
            Serial.print("🔄 MQTT reconnecting...");
            if (client.connect("ESP32Client")) {
                Serial.println("✅ Connected");
            } else {
                Serial.print("❌ Failed, rc=");
                Serial.print(client.state());
                delay(2000);
            }
        }
    }

    void loop() {
        if (!client.connected()) {
            reconnect();
        }
        client.loop();
    }

    bool isConnected() {
        return client.connected();
    }

    bool publish(const char* topic, const char* payload, size_t length) {
        return client.publish(topic, (const uint8_t*)payload, length);
    }

    bool publishBinary(const char* topic, const uint8_t* payload, size_t length) {
        return client.publish(topic, payload, length);
    }

    void subscribe(const char* topic) {
        client.subscribe(topic);
    }
};

#endif
