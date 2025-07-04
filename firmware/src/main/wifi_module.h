#ifndef WIFI_MODULE_H
#define WIFI_MODULE_H

#include <WiFi.h>

class WifiModule
{
public:
  WifiModule(const char *ssid, const char *password)
      : _ssid(ssid), _password(password) {}

  // Cập nhật thông tin WiFi mới (dùng sau khi fetch config)
  void updateCredentials(const char *newSsid, const char *newPassword)
  {
    _ssid = newSsid;
    _password = newPassword;
  }

  // Kết nối WiFi với timeout và retry logic
  bool connect(unsigned long timeoutMs = 10000, uint8_t maxRetries = 5)
  {
    const char *wifiList[][2] = {
        {ssid1, password},
        {ssid2, password}};

    for (int i = 0; i < 2; i++)
    {
      _ssid = wifiList[i][0];
      _password = wifiList[i][1];

      Serial.print("🔌 Đang kết nối WiFi: ");
      Serial.println(_ssid);

      WiFi.mode(WIFI_STA);
      WiFi.disconnect(true);
      delay(100);

      WiFi.begin(_ssid, _password);

      unsigned long start = millis();
      uint8_t retries = 0;

      while (WiFi.status() != WL_CONNECTED && millis() - start < timeoutMs)
      {
        delay(500);
        Serial.print(".");
        if (++retries >= maxRetries)
          break;
      }
      Serial.println();

      if (WiFi.status() == WL_CONNECTED)
      {
        Serial.println("✅ Đã kết nối WiFi thành công");
        Serial.print("📱 IP: ");
        Serial.println(WiFi.localIP());
        Serial.print("📶 RSSI: ");
        Serial.println(WiFi.RSSI());
        return true;
      }

      Serial.print("❌ Không kết nối được WiFi: ");
      Serial.println(_ssid);
      printWiFiStatusReason(WiFi.status());
    }

    // Cả hai đều thất bại
    Serial.println("❌ Không kết nối được bất kỳ WiFi nào!");
    return false;
  }

  // Trạng thái WiFi
  bool isConnected()
  {
    return WiFi.status() == WL_CONNECTED;
  }

  // Ngắt kết nối
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
    case WL_NO_SSID_AVAIL:
      Serial.println("🚫 SSID không tồn tại");
      break;
    case WL_CONNECT_FAILED:
      Serial.println("🔑 Sai mật khẩu hoặc bị từ chối");
      break;
    case WL_IDLE_STATUS:
      Serial.println("💤 ESP đang idle");
      break;
    case WL_DISCONNECTED:
      Serial.println("📴 ESP đã ngắt kết nối");
      break;
    default:
      Serial.println("❓ Lỗi không xác định");
      break;
    }
  }
};

#endif // WIFI_MODULE_H
