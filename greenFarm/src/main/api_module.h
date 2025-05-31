#ifndef API_MODULE_H
#define API_MODULE_H

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

class ApiModule {
private:
  const char *apiUrl;
  const char *deviceToken;
  const char *deviceId;
  HTTPClient http;

public:
  ApiModule(const char *url, const char *token, const char *id)
    : apiUrl(url), deviceToken(token), deviceId(id) {}

  bool begin() {
    // Nếu cần setup thêm lần đầu
    return true;
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

    Serial.println("🛠 Bắt đầu HTTP POST");
    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-token", deviceToken);
    http.addHeader("x-device-id", deviceId);

    int code = http.POST((uint8_t*)payload, length);
    Serial.printf("Mã HTTP trả về: %d\n", code);
    if (code <= 0) {
      Serial.printf("❌ POST lỗi: %s\n", http.errorToString(code).c_str());
      http.end();
      return false;
    }

    String response = http.getString();
    Serial.println("📥 Response body:");
    Serial.println(response);

    DynamicJsonDocument doc(1024);
    if (deserializeJson(doc, response)) {
      Serial.println("❌ Lỗi parse JSON");
      http.end();
      return false;
    }

    http.end();
    return true;
  }

  bool sendImage(const uint8_t *imageData, size_t imageLen) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("🚫 WiFi chưa kết nối");
      return false;
    }
    if (!imageData || imageLen == 0) {
      Serial.println("🚫 Ảnh trống, không gửi được");
      return false;
    }

    const char *uploadHost = "my.duocnv.top";
    const int uploadPort = 443;
    const char *uploadPath = "/v1/hydroponics/snapshots/images";
    String boundary = "----ESP32CamBoundary";

    // Tạo header form-data
    String bodyStart = "--" + boundary + "\r\n";
    bodyStart += "Content-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\n";
    bodyStart += "Content-Type: image/jpeg\r\n\r\n";

    String bodyEnd = "\r\n--" + boundary + "--\r\n";
    size_t contentLength = bodyStart.length() + imageLen + bodyEnd.length();

    WiFiClientSecure client;
    client.setInsecure();

    Serial.printf("🔗 Kết nối đến %s:%d ...\n", uploadHost, uploadPort);
    if (!client.connect(uploadHost, uploadPort)) {
      Serial.println("❌ Không kết nối được máy chủ");
      return false;
    }

    // Gửi HTTP header
    client.print(String("POST ") + uploadPath + " HTTP/1.1\r\n");
    client.print(String("Host: ") + uploadHost + "\r\n");
    client.print("User-Agent: ESP32-CAM\r\n");
    client.print("Content-Type: multipart/form-data; boundary=" + boundary + "\r\n");
    client.print("x-device-token: " + String(deviceToken) + "\r\n");
    client.print("x-device-id: " + String(deviceId) + "\r\n");
    client.print("Content-Length: " + String(contentLength) + "\r\n");
    client.print("Connection: close\r\n\r\n");

    // Gửi body
    client.print(bodyStart);
    size_t offset = 0;
    const size_t blockSize = 1024;
    while (offset < imageLen) {
      size_t chunk = min(blockSize, imageLen - offset);
      client.write(imageData + offset, chunk);
      offset += chunk;
    }
    client.print(bodyEnd);

    Serial.println("⏳ Đang chờ phản hồi từ server...");
    // Bỏ qua header
    while (client.connected()) {
      String line = client.readStringUntil('\n');
      if (line == "\r") break;
    }
    // Đọc body
    String response;
    while (client.available()) {
      response += client.readStringUntil('\n');
    }
    Serial.println("📥 Server response:");
    Serial.println(response);

    client.stop();
    return response.startsWith("{") || response.indexOf("OK") != -1;
  }

  void endConnection() {
    http.end();
  }
};

#endif // API_MODULE_H
