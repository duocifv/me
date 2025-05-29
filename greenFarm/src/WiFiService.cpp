#include "WiFiService.h"
#include <Arduino.h>

WiFiService::WiFiService(const char* ssid, const char* password) 
    : _ssid(ssid), _password(password) {}

void WiFiService::connect() {
    Serial.printf("Kết nối WiFi: %s\n", _ssid);
    WiFi.begin(_ssid, _password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi đã kết nối!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}

bool WiFiService::isConnected() const {
    return WiFi.status() == WL_CONNECTED;
}
