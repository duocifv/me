#ifndef WIFI_MODULE_H
#define WIFI_MODULE_H

#include <WiFi.h>

class WifiModule {
public:
    WifiModule(const char* ssid, const char* password)
      : _ssid(ssid), _password(password) {}

    // Tham số timeout mặc định 10 giây
    void connect(unsigned long timeoutMs = 10000) {
        Serial.print("🔌 Đang kết nối WiFi: ");
        Serial.println(_ssid);

        // Chế độ Station, xóa kết nối cũ
        WiFi.mode(WIFI_STA);
        WiFi.disconnect(true);
        delay(100);

        // Bắt đầu kết nối
        WiFi.begin(_ssid, _password);

        unsigned long startAttemptTime = millis();

        // Đợi kết nối trong thời gian timeout
        while (WiFi.status() != WL_CONNECTED && 
               millis() - startAttemptTime < timeoutMs) {
            delay(500);
            Serial.print(".");
        }
        Serial.println();

        if (WiFi.status() != WL_CONNECTED) {
            Serial.print("❌ Kết nối WiFi thất bại (status=");
            Serial.print(WiFi.status());
            Serial.println(")");
            return;
        }

        Serial.print("✅ Kết nối thành công! IP: ");
        Serial.println(WiFi.localIP());
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

#endif // WIFI_MODULE_H
