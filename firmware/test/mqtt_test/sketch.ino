#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include "wifi_module.h"
#include "mqtt_module.h"
#include "config.h"
#include "expander_relay.h"

// Tạo các đối tượng relay với pin mở rộng
ExpanderRelay fanRelay(19);
ExpanderRelay ledRelay(18);
ExpanderRelay pumpRelay(17);

// Tạo instance WiFi & MQTT
WifiModule wifi(ssid, password);
MQTTModule mqtt;

// Biến mô phỏng dữ liệu cảm biến
float ambientTemp = 25.0;
float humidity = 50.0;
float waterTemp = 20.0;

bool sensorEnabled = false;
bool cameraEnabled = false;

unsigned long lastSensor = 0;
unsigned long lastCamera = 0;

// =======================
// 📩 Xử lý dữ liệu từ MQTT
// =======================
void onMqttMessage(char *topic, byte *payload, unsigned int length)
{
    Serial.println("📩 MQTT message received");
    Serial.print("📦 Topic: ");
    Serial.println(topic);
    Serial.print("📦 Raw payload: ");
    Serial.write(payload, length);
    Serial.println();

    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, payload, length);
    if (err)
    {
        Serial.print("❌ JSON parse error: ");
        Serial.println(err.c_str());
        return;
    }

    if (strcmp(topic, "esp32/control") == 0)
    {
        if (doc.containsKey("fanOn"))
        {
            bool fan = doc["fanOn"];
            fanRelay.set(fan);
            Serial.print("🔧 Fan: ");
            Serial.println(fan ? "ON" : "OFF");
        }
        if (doc.containsKey("ledOn"))
        {
            bool led = doc["ledOn"];
            ledRelay.set(led);
            Serial.print("🔧 LED: ");
            Serial.println(led ? "ON" : "OFF");
        }
        if (doc.containsKey("pumpOn"))
        {
            bool pump = doc["pumpOn"];
            pumpRelay.set(pump);
            Serial.print("🔧 Pump: ");
            Serial.println(pump ? "ON" : "OFF");
        }
        if (doc.containsKey("sensor"))
        {
            sensorEnabled = doc["sensor"];
            Serial.print("🔧 Sensor publish: ");
            Serial.println(sensorEnabled ? "ENABLED" : "DISABLED");
        }
        if (doc.containsKey("camera"))
        {
            cameraEnabled = doc["camera"];
            Serial.print("🔧 Image publish: ");
            Serial.println(cameraEnabled ? "ENABLED" : "DISABLED");
        }
    }
    Serial.println("✅ Relays updated from MQTT");
}

// =======================
// 🔧 Setup
// =======================
void setup()
{
    Serial.begin(115200);
    delay(500);

    // Kết nối Wi-Fi
    Serial.print("WiFi: ");
    if (!wifi.connect())
    {
        Serial.println("❌ Failed");
        while (true)
            delay(1000);
    }
    Serial.println("✓ Connected");

    // Khởi tạo MQTT và đăng ký callback
    mqtt.begin(onMqttMessage);
}

// =======================
// 🔁 Loop chính
// =======================
void loop()
{
    // Duy trì kết nối MQTT
    mqtt.loop();

    // Gửi dữ liệu cảm biến định kỳ
    if (sensorEnabled && (millis() - lastSensor > SENSOR_INTERVAL))
    {
        lastSensor = millis();

        // Giả lập dao động
        ambientTemp += 0.1;
        if (ambientTemp > 30)
            ambientTemp = 25;
        humidity += 0.2;
        if (humidity > 70)
            humidity = 50;
        waterTemp += 0.3;
        if (waterTemp > 25)
            waterTemp = 20;

        mqtt.publishSensorData(waterTemp, ambientTemp, humidity);
        Serial.println("📤 Sensor data sent");
    }

    // Gửi trạng thái thiết bị định kỳ (giả lập gửi ảnh Base64 khoảng 6KB)
    if (cameraEnabled && (millis() - lastCamera > SENSOR_INTERVAL))
    {
        lastCamera = millis();

        // Tạo chuỗi Base64 giả lập (~6KB)
        String fakeImage = "data:image/jpeg;base64,";
        for (int i = 0; i < 6000; i++)
        {
            fakeImage += (char)('A' + (i % 26)); // chuỗi lặp từ A-Z
        }

        mqtt.publishCameraImageBase64(fakeImage.c_str());
        Serial.println("📤 Sent mock base64 image");
    }

    delay(10);
}
