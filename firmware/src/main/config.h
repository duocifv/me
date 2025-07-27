#ifndef CONFIG_H
#define CONFIG_H

#include <cstdint>

// ✅ Thông tin WiFi
const char* ssid     = "Mai Lan T2";
const char* password = "1234567899";

// Thông tin thiết bị
const char* deviceToken  = "esp32";
const char* deviceId     = "device-001";
const char* host         = "vegetable-container.onrender.com";
const uint16_t port      = 443;

// Đường dẫn API
const char* configPath   = "/v1/device/config";
const char* errorPath    = "/v1/device/error";
const char* sensorPath   = "/v1/hydroponics/snapshots";
const char* imgPath      = "/v1/hydroponics/snapshots/images";

// Chu kỳ gửi dữ liệu
const uint32_t DATA_INTERVAL   = 30000;
const uint32_t IMAGE_INTERVAL  = 20000;
const uint32_t PUMP_CYCLE_MS   = 60000;

// Cấu hình MQTT Broker
const char* MQTT_HOST     = "c53388ae7eaf409088a2a30c9f69a351.s1.eu.hivemq.cloud";
const char* MQTT_USER     = "duocnv";
const char* MQTT_PASS     = "Bao132132!!";
const int MQTT_PORT = 8883;  // Không phải const char*
const char* MQTT_PROTOCOL = "mqtts";

#endif // CONFIG_H
