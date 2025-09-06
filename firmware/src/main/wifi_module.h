#ifndef WIFI_MODULE_H
#define WIFI_MODULE_H

#include <ESP8266WiFi.h>

class WifiModule {
public:
  WifiModule(const char *ssid, const char *pass) : _ssid(ssid), _pass(pass) {}

  // blocking connect (dùng trong setup)
  bool connect(uint8_t maxRetries = 40, unsigned long retryDelayMs = 500) {
    WiFi.mode(WIFI_STA);
    WiFi.begin(_ssid, _pass);
    Serial.printf("🔌 WiFi connecting to %s\n", _ssid);

    uint8_t tries = 0;
    while (WiFi.status() != WL_CONNECTED && tries < maxRetries) {
      delay(retryDelayMs);
      Serial.print('.');
      tries++;
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("✅ WiFi connected. IP: ");
      Serial.println(WiFi.localIP());
      return true;
    }
    Serial.println("❌ WiFi connect failed");
    return false;
  }

  // giữ API khớp với main.ino, nhưng không auto-retry
  void loop() {
    // không làm gì thêm, chỉ để giữ tương thích
  }

  bool isConnected() const { return WiFi.status() == WL_CONNECTED; }

private:
  const char *_ssid;
  const char *_pass;
};

#endif // WIFI_MODULE_H
