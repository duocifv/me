#ifndef HTTP_SENSORS_MODULE_H
#define HTTP_SENSORS_MODULE_H

#include <WiFi.h>
#include <WiFiClientSecure.h>

/**
 * @brief Module gửi dữ liệu sensor qua HTTP POST.
 */
class HttpSensorsModule {
private:
  const char *host;
  const int port;
  const char *path;
  const char *deviceToken;
  const char *deviceId;
  WiFiClientSecure client;

public:
  /**
   * @brief Hàm khởi tạo.
   * @param h Host (tên miền hoặc IP)
   * @param p Port (ví dụ: 443)
   * @param pa Path (ví dụ: "/api/data")
   * @param token Device token (chuỗi xác thực)
   * @param id Device ID (mã định danh thiết bị)
   */
  HttpSensorsModule(const char *h, int p, const char *pa, const char *token, const char *id)
      : host(h), port(p), path(pa), deviceToken(token), deviceId(id) {
    client.setInsecure(); // ⚠ Bỏ kiểm tra SSL cert cho đơn giản
  }

  /**
   * @brief Gọi nếu cần setup thêm, hiện tại chỉ trả true.
   */
  bool begin() {
    return true;
  }

  /**
   * @brief Gửi dữ liệu JSON đến server qua HTTPS.
   * @param payload Nội dung JSON
   * @param length Độ dài nội dung
   * @return true nếu gửi thành công, ngược lại false
   */
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

    // Tạo và gửi HTTP request
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

    // Đọc response từ server
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

  /**
   * @brief Ngắt kết nối khỏi server.
   */
  void endConnection() {
    client.stop();
  }
};

#endif // HTTP_SENSORS_MODULE_H
