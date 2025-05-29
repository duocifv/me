#include "Uploader.h"
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

// Dùng chung TLS client nếu cần nhiều kết nối
static WiFiClientSecure tlsClient;

Uploader::Uploader(const char* host, int port, const char* token, const char* deviceId)
  : _host(host), _port(port), _token(token), _deviceId(deviceId)
{
  tlsClient.setInsecure(); // Chỉ dev, production nên dùng CA cert
}

bool Uploader::sendSnapshot(float temp, float humid, float waterTemp, const uint8_t* imgBuf, size_t imgLen) {
  bool ok = true;

  // 1) Gửi dữ liệu cảm biến
  {
    HTTPClient http;
    String url = String("https://") + _host + ":" + String(_port) + "/v1/hydroponics/snapshots";
    if (!http.begin(tlsClient, url)) {
      Serial.println("❌ HTTP begin failed (sensor)");
      ok = false;
    } else {
      http.addHeader("Content-Type", "application/json");
      http.addHeader("accept", "*/*");
      http.addHeader("x-device-token", _token);
      http.addHeader("x-device-id", _deviceId);

      String json = String("{") +
        "\"ambient_temperature\":" + String(temp, 2) + "," +
        "\"humidity\":"             + String(humid, 2) + "," +
        "\"water_temperature\":"     + String(waterTemp, 2) +
        "}";

      Serial.println("⏳ [Uploader] Sending sensor data:");
      Serial.println(json);
      int code = http.POST(json);
      String resp = http.getString();
      Serial.printf("[Uploader] Sensor HTTP %d\n", code);
      Serial.println("Response:");
      Serial.println(resp);
      if (code < 200 || code >= 300) ok = false;
      http.end();
    }
  }

  // 2) Gửi ảnh (multipart/form-data)
  {
    const String boundary = "----ESP32Boundary";
    String head = String("--") + boundary + "\r\n" +
                  "Content-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\n" +
                  "Content-Type: image/jpeg\r\n\r\n";
    String tail = String("\r\n--") + boundary + "--\r\n";
    size_t contentLength = head.length() + imgLen + tail.length();

    WiFiClientSecure client;
    client.setInsecure();
    if (!client.connect(_host, _port)) {
      Serial.println("❌ TLS connect failed (image)");
      ok = false;
    } else {
      client.printf("POST /v1/hydroponics/snapshots/images HTTP/1.1\r\n");
      client.printf("Host: %s:%d\r\n", _host, _port);
      client.printf("Content-Type: multipart/form-data; boundary=%s\r\n", boundary.c_str());
      client.printf("Content-Length: %u\r\n", (unsigned int)contentLength);
      client.printf("accept: */*\r\n");
      client.printf("x-device-token: %s\r\n", _token);
      client.printf("x-device-id: %s\r\n", _deviceId);
      client.print("\r\n");

      client.print(head);
      client.write(imgBuf, imgLen);
      client.print(tail);

      Serial.println("⏳ [Uploader] Waiting image response...");
      while (client.connected()) {
        String line = client.readStringUntil('\n');
        if (line == "\r") break;
      }
      String resp = client.readString();
      Serial.println("[Uploader] Image response:");
      Serial.println(resp);
      client.stop();
      // Có thể parse status code từ resp nếu cần, ở đây giả định thành công nếu có body
    }
  }

  return ok;
}
