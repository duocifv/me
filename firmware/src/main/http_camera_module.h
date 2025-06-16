#ifndef HTTP_CAMERA_MODULE_H
#define HTTP_CAMERA_MODULE_H

#include <WiFiClientSecure.h>
#include <Arduino.h>
#include "esp_camera.h"

/*
  HttpCameraModule (tối ưu, có đo thời gian):
   - Không dùng String động cho header/footer
   - Đo thời gian gửi (từ khi gửi body đến khi nhận được status line)
   - Trả về bool để biết thành công/thất bại đồng thời trả về durationMs
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
        _boundary(boundary),
        _timeoutMs(10000) {}

    // Thiết lập timeout (ms) khi chờ response (mặc định 10s)
    void setTimeout(unsigned long timeoutMs) {
        _timeoutMs = timeoutMs;
    }

    /*
      Gửi ảnh lên server:
       - fb: camera frame buffer (JPEG)
       - durationMs: tham chiếu để ghi lại thời gian (ms) từ khi bắt đầu ghi body đến khi đọc được status line
       - Trả về true nếu status code bắt đầu bằng "HTTP/1.1 2"
    */
    bool send(camera_fb_t* fb, unsigned long &durationMs) {
        if (!fb) {
            Serial.println("❌ send(): fb == nullptr");
            return false;
        }

        // 1) Khởi tạo client
        WiFiClientSecure client;
        if (_port == 443) {
            client.setInsecure(); // Bỏ qua verify TLS (chỉ TEST)
        }

        // 2) Kết nối đến server
        if (!client.connect(_host, _port)) {
            Serial.println("❌ Không kết nối được server");
            return false;
        }
        client.setTimeout(_timeoutMs);

        // 3) Tạo multipart header & footer trong buffer tĩnh
        char headerBuf[128];
        int headerLen = snprintf(
            headerBuf, sizeof(headerBuf),
            "--%s\r\n"
            "Content-Disposition: form-data; name=\"file\"; filename=\"photo.jpg\"\r\n"
            "Content-Type: image/jpeg\r\n\r\n",
            _boundary
        );

        char footerBuf[64];
        int footerLen = snprintf(
            footerBuf, sizeof(footerBuf),
            "\r\n--%s--\r\n",
            _boundary
        );

        // 4) Tính content-length
        size_t totalLen = (size_t)headerLen + fb->len + (size_t)footerLen;

        // 5) Gửi request line + headers
        client.printf("POST %s HTTP/1.1\r\n", _path);
        client.printf("Host: %s\r\n", _host);
        client.printf("x-device-token: %s\r\n", _deviceToken);
        client.printf("x-device-id: %s\r\n", _deviceId);
        client.printf("Content-Type: multipart/form-data; boundary=%s\r\n", _boundary);
        client.printf("Content-Length: %u\r\n", (unsigned)totalLen);
        client.print("Connection: close\r\n");
        client.print("\r\n"); // Kết thúc phần header

        // 6) Đo thời gian: bắt đầu từ khi gửi headerBuf lần đầu
        unsigned long t_start = millis();

        // Gửi headerBuf
        client.write((const uint8_t*)headerBuf, headerLen);
        // Gửi JPEG data
        client.write(fb->buf, fb->len);
        // Gửi footerBuf
        client.write((const uint8_t*)footerBuf, footerLen);

        // 7) Chờ status line (block tối đa _timeoutMs)
        while (!client.available() && (millis() - t_start) < _timeoutMs) {
            delay(10);
        }
        if (!client.available()) {
            Serial.printf("❌ Không nhận được status line (timeout %lums)\n", _timeoutMs);
            client.stop();
            durationMs = millis() - t_start;
            return false;
        }

        // 8) Đọc status line
        String statusLine = client.readStringUntil('\n');
        statusLine.trim();  // Loại bỏ '\r'
        unsigned long t_end = millis();
        durationMs = t_end - t_start;  // Tính thời gian gửi

        // In status line và thời gian
        Serial.println(statusLine);
        Serial.printf("⏱️ Thời gian gửi: %lums\n", durationMs);

        client.stop();

        // 9) Kiểm tra status: nếu bắt đầu bằng "HTTP/1.1 2"
        return statusLine.startsWith("HTTP/1.1 2");
    }

private:
    const char*     _host;
    uint16_t        _port;
    const char*     _path;
    const char*     _deviceToken;
    const char*     _deviceId;
    const char*     _boundary;
    unsigned long   _timeoutMs;
};

#endif // HTTP_CAMERA_MODULE_H
