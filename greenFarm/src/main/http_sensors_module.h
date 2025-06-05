#ifndef HTTP_ERROR_MODULE_H
#define HTTP_ERROR_MODULE_H

#include <WiFi.h>
#include <WiFiClientSecure.h>

class HttpErrorModule {
private:
  const char* host;
  const int   port;
  const char* path;         // Ví dụ "/device-error"
  const char* deviceToken;  // Gửi header x-device-token
  const char* deviceId;     // Gửi header x-device-id
  WiFiClientSecure client;

public:
  HttpErrorModule(const char* h, int p, const char* pa, const char* token, const char* id)
    : host(h), port(p), path(pa), deviceToken(token), deviceId(id)
  {
    client.setInsecure();  // ⚠ Không kiểm tra SSL cert (đơn giản hoá)
  }

  bool begin() {
    // Nếu cần khởi tạo gì thêm, đưa vào đây
    return true;
  }

  /**
   * Gửi báo lỗi lên server qua POST JSON.
   * Trả về true nếu server trả HTTP/1.1 200…, false nếu có lỗi.
   *
   * errorType: chuỗi định danh loại lỗi (ví dụ "WiFi", "Sensor", "Pump", …)
   * errorMessage: mô tả chi tiết lỗi
   */
  bool sendError(const char* errorType, const char* errorMessage) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("🚫 [Error] WiFi chưa kết nối, không thể gửi lỗi");
      return false;
    }

    Serial.printf("🛠 [Error] Kết nối tới %s:%d\n", host, port);
    if (!client.connect(host, port)) {
      Serial.println("❌ [Error] Kết nối SSL thất bại");
      return false;
    }

    // Tạo JSON nhỏ gọn
    String body = String("{") +
                  "\"deviceId\":\"" + deviceId + "\"," +
                  "\"error_type\":\"" + errorType + "\"," +
                  "\"error_message\":\"" + errorMessage + "\"" +
                  "}";

    size_t bodyLen = body.length();

    // Tạo HTTP POST request
    String request = String("POST ") + path + " HTTP/1.1\r\n" +
                     "Host: " + host + "\r\n" +
                     "Content-Type: application/json\r\n" +
                     "x-device-token: " + deviceToken + "\r\n" +
                     "x-device-id: " + deviceId + "\r\n" +
                     "Content-Length: " + String(bodyLen) + "\r\n" +
                     "Connection: close\r\n\r\n" +
                     body;

    client.print(request);
    Serial.println("✅ [Error] Request đã gửi:");
    Serial.println(request);

    // Đọc dòng status line
    String statusLine = client.readStringUntil('\n');
    if (statusLine.length() == 0) {
      Serial.println("⚠️ [Error] Không nhận được response");
      client.stop();
      return false;
    }
    statusLine.trim();  // xóa \r và \n

    if (!statusLine.startsWith("HTTP/1.1 200")) {
      Serial.print("❌ [Error] Server trả về: ");
      Serial.println(statusLine);
      client.stop();
      return false;
    }

    // Bỏ qua phần header còn lại
    while (client.connected()) {
      String line = client.readStringUntil('\n');
      if (line == "\r" || line == "\n" || line.length() == 0) {
        break;
      }
    }

    client.stop();
    Serial.println("✅ [Error] Đã gửi lỗi thành công");
    return true;
  }

  /**
   * Nếu muốn debug, có thể lấy raw response (header + body)
   */
  // const String& getRawResponse() const {
  //   return rawResponse;
  // }
};

#endif // HTTP_ERROR_MODULE_H
