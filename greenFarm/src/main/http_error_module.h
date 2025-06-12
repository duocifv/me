#ifndef API_MODULE_H
#define API_MODULE_H

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>

/**
 * Module chung để gửi API (bao gồm lỗi, sensor, camera...)
 */
class HttpErrorModule
{
private:
  const char *host;
  const int port;
  const char *path;
  const char *deviceToken;
  const char *deviceId;
  WiFiClientSecure client;

public:
  HttpErrorModule(const char *h, int p, const char *pa, const char *token, const char *id)
      : host(h), port(p), path(pa), deviceToken(token), deviceId(id)
  {
    client.setInsecure(); // ⚠️ Bỏ kiểm chứng SSL để đơn giản
  }

  bool begin()
  {
    return true;
  }

  bool sendData(const char *payload, size_t length)
  {
    if (WiFi.status() != WL_CONNECTED)
    {
      Serial.println("🚫 WiFi chưa kết nối");
      return false;
    }
    if (!payload || length == 0)
    {
      Serial.println("🚫 Payload rỗng");
      return false;
    }

    Serial.printf("🛠 Kết nối tới %s:%d\n", host, port);
    if (!client.connect(host, port))
    {
      Serial.println("❌ Kết nối thất bại");
      return false;
    }

    // Xây dựng request
    String request = String("POST ") + path + " HTTP/1.1\r\n" +
                     "Host: " + host + "\r\n" +
                     "Content-Type: application/json; charset=utf-8\r\n" +
                     "x-device-token: " + deviceToken + "\r\n" +
                     "x-device-id: " + deviceId + "\r\n" +
                     "Content-Length: " + String(length) + "\r\n" +
                     "Connection: close\r\n\r\n";
    client.print(request);
    client.write((const uint8_t *)payload, length);

    Serial.println("✅ Request đã gửi:");
    Serial.println(request);
    Serial.println(payload);

    // Đọc response
    String response;
    unsigned long timeout = millis();
    while (client.connected() && millis() - timeout < 5000)
    {
      while (client.available())
      {
        response += client.readStringUntil('\n') + '\n';
      }
    }
    client.stop();

    Serial.println("📥 Response:");
    Serial.println(response);
    return true;
  }

  /**
   * Convenience: tự build JSON lỗi rồi gọi sendData
   */
  bool sendError(const char *errorCode, const char *errorMessage)
  {
    String json = String("{\"deviceId\":\"") + deviceId +
                  "\",\"error_code\":\"" + errorCode +
                  "\",\"error_message\":\"" + errorMessage + "\"}";

    return sendData(json.c_str(), json.length());
  }

  void endConnection()
  {
    client.stop();
  }
};

#endif // API_MODULE_H
