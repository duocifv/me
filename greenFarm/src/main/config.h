#ifndef CONFIG_H
#define CONFIG_H
#include <cstdint>

// WiFi & API
extern const char* ssid;
extern const char* password;
extern const char* deviceToken;
extern const char* deviceId;
extern const char* host;
extern const uint16_t port;
extern const char* sensorPath;
extern const char* imgPath;

// Task intervals (ms)
extern const uint32_t SENSOR_INTERVAL;
extern const uint32_t DATA_INTERVAL;
extern const uint32_t IMAGE_INTERVAL;
extern const uint32_t PUMP_CYCLE_MS;
extern const uint32_t PUMP_ON_MS;

#endif // CONFIG_H
