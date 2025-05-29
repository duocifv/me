// WiFiService.cpp
#include "WiFiService.h"
#include <Arduino.h>

WiFiService::WiFiService(const char* ssid, const char* pass)
  : _ssid(ssid), _pass(pass) {}

void WiFiService::connect() {
  WiFi.begin(_ssid, _pass);
  Serial.print("WiFi connecting");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    Serial.print('.'); delay(300);
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" connected");
    Serial.print("IP: "); Serial.println(WiFi.localIP());
  } else {
    Serial.println(" failed");
  }
}

bool WiFiService::isConnected(){
  return WiFi.status() == WL_CONNECTED;
}