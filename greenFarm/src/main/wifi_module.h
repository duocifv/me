#ifndef WIFI_MODULE_H
#define WIFI_MODULE_H

#include <WiFi.h>

class WifiModule {
public:
  WifiModule(const char* ssid, const char* password)
    : _ssid(ssid), _password(password) {}

  // Cập nhật thông tin WiFi (dùng sau khi fetch config)
  void updateCredentials(const char* newSsid, const char* newPassword) {
    _ssid = newSsid;
    _password = newPassword;
  }

  // Kết nối với timeout mặc định là 10 giây
  void connect(unsigned long timeoutMs = 10000) {
    Serial.print("🔌 Đang kết nối WiFi: ");
    Serial.println(_ssid);

    WiFi.mode(WIFI_STA);
    WiFi.disconnect(true);
    delay(100);

    WiFi.begin(_ssid, _password);
    unsigned long startAttemptTime = millis();

    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < timeoutMs) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();

    if (WiFi.status() != WL_CONNECTED) {
      Serial.print("❌ Kết nối WiFi thất bại (status=");
      Serial.print(WiFi.status());
      Serial.print(") 💡 Gợi ý: ");
      switch (WiFi.status()) {
        case WL_NO_SSID_AVAIL: Serial.println("SSID không tồn tại"); break;
        case WL_CONNECT_FAILED: Serial.println("Sai mật khẩu hoặc AP từ chối"); break;
        case WL_IDLE_STATUS: Serial.println("ESP32 đang idle"); break;
        case WL_DISCONNECTED: Serial.println("Đã ngắt kết nối"); break;
        default: Serial.println("Lỗi không xác định"); break;
      }
      return;
    } else {
      Serial.println("\n✅ Đã kết nối WiFi thành công");
      Serial.print("📱 IP: "); Serial.println(WiFi.localIP());
      Serial.print("📶 RSSI: "); Serial.println(WiFi.RSSI());
    }
  }

  bool isConnected() {
    return WiFi.status() == WL_CONNECTED;
  }

  void disconnect() {
    WiFi.disconnect();
    Serial.println("🔌 WiFi đã ngắt kết nối");
  }

private:
  const char* _ssid;
  const char* _password;
};

#endif  // WIFI_MODULE_H
