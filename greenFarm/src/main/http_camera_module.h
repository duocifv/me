#ifndef HTTP_CAMERA_MODULE_H
#define HTTP_CAMERA_MODULE_H

#include <WiFiClientSecure.h>
#include <Arduino.h>
#include "esp_camera.h"

/*
  Module HttpCameraModule chịu trách nhiệm:
   - Thiết lập thông tin server (host, port, path, headers)
   - Gửi ảnh JPEG (camera_fb_t*) lên server bằng POST multipart/form-data
*/

class HttpCameraModule {
public:
    // Constructor: truyền hostname, port, path, device token và device id
    HttpCameraModule(const char* host,
                     uint16_t port,
                     const char* path,
                     const char* deviceToken,
                     const char* deviceId,
                     const char* boundary = "----ESP32CAM123456")
      : _host(host),
        _port(port),
        _path(path),
        _deviceToken(deviceToken),
        _deviceId(deviceId),
        _boundary(boundary) {}

    // Gửi ảnh (fb->buf, fb->len) lên server. Trả về true nếu thành công (kiểm tra qua Serial).
    bool send(camera_fb_t* fb) {
        if (!fb) {
            Serial.println("❌ HttpCameraModule::send(): fb == nullptr");
            return false;
        }

        WiFiClientSecure client;
        client.setInsecure(); // Bỏ qua xác thực chứng chỉ (TEST). Trong thực tế nên xử lý CA cert.

        Serial.printf("🌐 Kết nối đến %s:%u …\n", _host, _port);
        if (!client.connect(_host, _port)) {
            Serial.println("❌ Kết nối tới server thất bại");
            return false;
        }

        // Khởi tạo phần header của multipart
        String partHeader = String("--") + _boundary + "\r\n" +
                            "Content-Disposition: form-data; name=\"file\"; filename=\"photo.jpg\"\r\n" +
                            "Content-Type: image/jpeg\r\n\r\n";

        String partFooter = String("\r\n--") + _boundary + "--\r\n";

        size_t contentLength = partHeader.length() + fb->len + partFooter.length();

        // Gửi request line và header
        client.printf("POST %s HTTP/1.1\r\n", _path);
        client.printf("Host: %s\r\n", _host);
        client.printf("x-device-token: %s\r\n", _deviceToken);
        client.printf("x-device-id: %s\r\n", _deviceId);
        client.printf("Content-Type: multipart/form-data; boundary=%s\r\n", _boundary);
        client.printf("Content-Length: %u\r\n", (unsigned int)contentLength);
        client.print("Connection: close\r\n");
        client.print("\r\n"); // Kết thúc header, bắt đầu body

        // Gửi phần header của multipart
        client.print(partHeader);

        // Gửi trực tiếp nhị phân ảnh JPEG
        client.write(fb->buf, fb->len);

        // Gửi phần footer của multipart (đóng multipart)
        client.print(partFooter);

        // Đọc và in response từ server (nếu có)
        uint32_t start = millis();
        while (client.connected() && millis() - start < _timeoutMs) {
            while (client.available()) {
                String line = client.readStringUntil('\n');
                Serial.println(line);
            }
        }
        client.stop();
        Serial.println("✅ Gửi ảnh xong (hoặc đã timeout đọc response).");

        return true;
    }

    // Thiết lập timeout (ms) khi chờ read response (mặc định 10s)
    void setTimeout(unsigned long timeoutMs) {
        _timeoutMs = timeoutMs;
    }

private:
    const char* _host;
    uint16_t    _port;
    const char* _path;
    const char* _deviceToken;
    const char* _deviceId;
    const char* _boundary;
    unsigned long _timeoutMs = 10000; // 10 giây mặc định
};

#endif // HTTP_CAMERA_MODULE_H
