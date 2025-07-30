#ifndef CONFIG_H
#define CONFIG_H

#include <cstdint>

// ✅ Thông tin WiFi
const char* ssid     = "Mai Lan T2";
const char* password = "1234567899";

// Chu kỳ gửi dữ liệu
const uint32_t SENSOR_INTERVAL = 500000; 
const uint32_t CAMERA_INTERVAL = 500000;  

// Cấu hình MQTT Broker
const char *MQTT_HOST = "c53388ae7eaf409088a2a30c9f69a351.s1.eu.hivemq.cloud";
const char *MQTT_USER = "duocnv";
const char *MQTT_PASS = "Bao132132!!";
const int MQTT_PORT = 8883;
const char *MQTT_PROTOCOL = "mqtts";

#endif // CONFIG_H
