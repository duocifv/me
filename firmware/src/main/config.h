#ifndef CONFIG_H
#define CONFIG_H


// WiFi
const char* WIFI_SSID = "Mai Lan T2";
const char* WIFI_PASS = "1234567899";


// MQTT (TLS)
const char* MQTT_HOST = "c53388ae7eaf409088a2a30c9f69a351.s1.eu.hivemq.cloud";
const char* MQTT_USER = "duocnv2";
const char* MQTT_PASS = "Bao132132!!";
const int MQTT_PORT = 8883;


#define DEVICE_ID "node01" // phải là chuỗi hằng
#define SENSOR_INTERVAL 10000 // 10 giây (ms)


#endif // CONFIG_H