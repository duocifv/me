#ifndef API_MODULE_H
#define API_MODULE_H

#include <WiFi.h>
#include <WiFiClientSecure.h>

class HttpSensorModule {
private:
  const char *host;
  const int port;
  const char *path;
  const char *deviceToken;
  const char *deviceId;
  WiFiClientSecure client;

public:
  HttpSensorModule(const char *h, int p, const char *pa, const char *token, const char *id)
    : host(h), port(p), path(pa), deviceToken(token), deviceId(id) {
    client.setInsecure();  // ⚠ Không kiểm tra SSL cert (đơn giản hoá)
  }

  bool begin() {
    return true;  // nếu cần setup thêm, để đây
  }

  bool sendData(const char *payload, size_t length) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("🚫 WiFi chưa kết nối");
      return false;
    }
    if (!payload || length == 0) {
      Serial.println("🚫 Payload rỗng");
      return false;
    }

    Serial.printf("🛠 Kết nối tới %s:%d\n", host, port);
    if (!client.connect(host, port)) {
      Serial.println("❌ Kết nối thất bại");
      return false;
    }

    String request = String("POST ") + path + " HTTP/1.1\r\n" +
                     "Host: " + host + "\r\n" +
                     "Content-Type: application/json\r\n" +
                     "x-device-token: " + deviceToken + "\r\n" +
                     "x-device-id: " + deviceId + "\r\n" +
                     "Content-Length: " + String(length) + "\r\n" +
                     "Connection: close\r\n\r\n";

    client.print(request);
    client.write((const uint8_t *)payload, length);

    Serial.println("✅ Request đã gửi");

    // Đọc response
    String response;
    unsigned long timeout = millis();
    while (client.connected() && millis() - timeout < 5000) {
      while (client.available()) {
        String line = client.readStringUntil('\n');
        response += line + "\n";
      }
      delay(10);
    }
    client.stop();

    Serial.println("📥 Response:");
    Serial.println(response);

    return true;
  }

  void endConnection() {
    client.stop();
  }
};

#endif  // API_MODULE_H
