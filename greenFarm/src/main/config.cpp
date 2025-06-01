#include "config.h"
#include <cstdint> 

// WiFi & API
const char* ssid         = "Mai Lan T2";
const char* password     = "1234567899";
const char* deviceToken  = "esp32";
const char* deviceId     = "device-001";
const char* host         = "my.duocnv.top";
const uint16_t port      = 443;
const char* sensorPath   = "/v1/hydroponics/snapshots";
const char* imgPath      = "/v1/hydroponics/snapshots/images";

// Task intervals (ms)
const uint32_t SENSOR_INTERVAL = 5000;
const uint32_t DATA_INTERVAL   = 30000;
const uint32_t IMAGE_INTERVAL  = 20000;
const uint32_t PUMP_CYCLE_MS   = 60000;
const uint32_t PUMP_ON_MS      = 5000;
