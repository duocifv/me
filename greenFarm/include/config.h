#ifndef CONFIG_H
#define CONFIG_H

// WiFi
static constexpr const char* WIFI_SSID     = "Mai Lan";
static constexpr const char* WIFI_PASSWORD = "1234567899";

// Server
static constexpr const char* SERVER_HOST   = "my.duocnv.top";
static constexpr int         SERVER_PORT   = 443;
static constexpr const char* DEVICE_TOKEN  = "esp32";
static constexpr const char* DEVICE_ID     = "device-001";
static constexpr const char* API_SNAPSHOT  = "/v1/hydroponics/snapshots";

// Relay
constexpr int RELAY_PIN = 12;

// DHT sensor
constexpr int DHT_PIN = 27;
#define DHT_TYPE DHT22  // Giữ #define vì DHT library yêu cầu

// OneWire sensor (DS18B20)
constexpr int ONEWIRE_PIN = 14;

// Loop interval (milliseconds)
constexpr unsigned long LOOP_INTERVAL_MS = 15000;

#endif // CONFIG_H
