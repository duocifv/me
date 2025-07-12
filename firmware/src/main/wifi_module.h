#ifndef WIFI_MODULE_H
#define WIFI_MODULE_H

#include <WiFi.h>

class WifiModule
{
public:
  WifiModule(const char *ssid, const char *password)
      : _ssid(ssid), _password(password) {}

  bool connect(unsigned long timeoutMs = 10000)  // ⏱ giới hạn 10 giây
  {
    Serial.print("🔌 Đang kết nối WiFi: ");
    Serial.println(_ssid);

    WiFi.mode(WIFI_STA);
    WiFi.disconnect(true);
    delay(300);
    WiFi.begin(_ssid, _password);

    unsigned long start = millis();

    while (millis() - start < timeoutMs)
    {
      wl_status_t status = WiFi.status();
      Serial.print("⏳ Status: ");
      Serial.print(status);
      Serial.print(" - ");

      if (status == WL_CONNECTED && WiFi.localIP().toString() != "0.0.0.0")
      {
        Serial.println("✅ Đã kết nối WiFi");
        Serial.print("📱 IP: ");
        Serial.println(WiFi.localIP());
        Serial.print("📶 RSSI: ");
        Serial.println(WiFi.RSSI());
        return true;
      }

      printWiFiStatusReason(status);
      delay(500);  // ⏳ mỗi lần thử cách nhau 500ms
    }

    Serial.println("❌ Không kết nối được WiFi trong 10 giây!");
    return false;
  }

  bool isConnected()
  {
    return WiFi.status() == WL_CONNECTED && WiFi.localIP().toString() != "0.0.0.0";
  }

  void disconnect()
  {
    WiFi.disconnect(true);
    Serial.println("🔌 WiFi đã ngắt kết nối");
  }

private:
  const char *_ssid;
  const char *_password;

  void printWiFiStatusReason(wl_status_t status)
  {
    switch (status)
    {
    case WL_NO_SSID_AVAIL:     Serial.println("🚫 SSID không tồn tại"); break;
    case WL_CONNECT_FAILED:    Serial.println("🔑 Sai mật khẩu hoặc bị từ chối"); break;
    case WL_IDLE_STATUS:       Serial.println("💤 ESP đang idle"); break;
    case WL_DISCONNECTED:      Serial.println("📴 ESP đã ngắt kết nối"); break;
    case WL_CONNECTION_LOST:   Serial.println("📶 Kết nối bị mất"); break;
    default:                   Serial.println("❓ Lỗi không xác định"); break;
    }
  }
};

#endif // WIFI_MODULE_H
