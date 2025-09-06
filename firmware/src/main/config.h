#ifndef CONFIG_H
#define CONFIG_H

// ==== WiFi ====
const char* WIFI_SSID = "Mai Lan T2";
const char* WIFI_PASS = "1234567899";

// ==== MQTT (TLS) ====
const char* MQTT_HOST = "c53388ae7eaf409088a2a30c9f69a351.s1.eu.hivemq.cloud";
const char* MQTT_USER = "duocnv2";
const char* MQTT_PASS = "Bao132132!!";
const int   MQTT_PORT = 8883;

// ==== Device ====
#define DEVICE_ID "node01"           // phải là chuỗi hằng
#define SENSOR_INTERVAL 10000        // 10 giây (ms)

// ==== Relay pins ====
#define RELAY_FAN_COOL D1
#define RELAY_FAN_VENT D2
#define RELAY_LED      D5
#define RELAY_PUMP     D6

// ==== Sensor pins ====
#define PIN_DHT    D4   // DHT22
#define PIN_DS18   D3   // DS18B20

#endif // CONFIG_H
