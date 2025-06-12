#ifndef CONFIG_H
#define CONFIG_H

#include <cstdint>

// Thông tin WiFi & API (định nghĩa trực tiếp, không extern)
const char* ssid         = "Mai Lan T2";
const char* password     = "1234567899";
const char* deviceToken  = "esp32";
const char* deviceId     = "device-001";
const char* host         = "my.duocnv.top";
const uint16_t port      = 443;

// Đường dẫn API
const char* configPath   = "/v1/device/config";                  // Lấy cấu hình động
const char* errorPath    = "/v1/device/error";                   // Báo lỗi
const char* sensorPath   = "/v1/hydroponics/snapshots";        // Gửi dữ liệu cảm biến
const char* imgPath      = "/v1/hydroponics/snapshots/images"; // Gửi ảnh

// Task intervals (ms)
const uint32_t SENSOR_INTERVAL = 5000;   // 5s đọc cảm biến
const uint32_t DATA_INTERVAL   = 30000;  // 30s gửi data
const uint32_t IMAGE_INTERVAL  = 20000;  // 20s gửi ảnh
const uint32_t PUMP_CYCLE_MS   = 60000;  // 60s chu kỳ bơm OFF → ON
const uint32_t PUMP_ON_MS      = 5000;   // 5s bơm ON

#endif // CONFIG_H
