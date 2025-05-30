#include "WiFiService.h"
#include <WiFi.h>
#include <Arduino.h>

WiFiService::WiFiService(const char* ssid, const char* pass)
  : _ssid(ssid), _pass(pass) {}

// Chỉ gọi trong setup(): in full message và chờ tối đa 15s
void WiFiService::connect() {
  Serial.print("WiFi connecting to ");
  Serial.print(_ssid);
  Serial.print("...");

  WiFi.begin(_ssid, _pass);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    Serial.print('.');
    delay(300);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(" failed to connect within timeout");
  }
  _firstAttempt = false;  // đã kết thúc lần đầu
}

// Gọi trong loop() khi mất kết nối: in vắn tắt, không chờ lâu
bool WiFiService::reconnect() {
  if (_firstAttempt) {
    // chưa bao giờ connect() rồi, fallback về connect()
    connect();
    return isConnected();
  }

  Serial.print("[⚠️ WiFi] Reconnect to ");
  Serial.print(_ssid);
  Serial.print("...");
  WiFi.begin(_ssid, _pass);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 5000) {
    Serial.print('.');
    delay(200);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" OK");
  } else {
    Serial.println(" FAIL");
  }
  return isConnected();
}

bool WiFiService::isConnected() {
  return (WiFi.status() == WL_CONNECTED);
}
