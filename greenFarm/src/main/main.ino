#include <Arduino.h>

#include "wifi_module.h"           // Module Wi-Fi của bạn
#include "camera_module.h"         // Module chụp ảnh mới tạo
#include "http_camera_module.h"     // Module gửi ảnh mới tạo

// Thông tin Wi-Fi (thay bằng SSID/PASS thực tế)
static const char* WIFI_SSID     = "Mai Lan T2";
static const char* WIFI_PASSWORD = "1234567899";

// Thông tin server API (theo ví dụ của bạn)
static const char* SERVER_HOST    = "my.duocnv.top";
static const uint16_t SERVER_PORT = 443;  // HTTPS: 443 | HTTP: 80
static const char* SERVER_PATH    = "/v1/hydroponics/snapshots/images";

// Header riêng (theo ví dụ của bạn)
static const char* DEVICE_TOKEN = "esp32";
static const char* DEVICE_ID    = "device-001";

// Đối tượng module
WifiModule      wifiModule(WIFI_SSID, WIFI_PASSWORD);
CameraModule    cameraModule;
HttpCameraModule httpModule(SERVER_HOST, SERVER_PORT, SERVER_PATH, DEVICE_TOKEN, DEVICE_ID);

// Khoảng thời gian giữa các lần chụp gửi (ms)
const unsigned long UPLOAD_INTERVAL = 20000UL; // 20 giây

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("=== Bắt đầu ESP32-CAM Test ===");

    // ---- 1. Kết nối Wi-Fi ----
    wifiModule.connect(15000); // timeout 15s
    if (!wifiModule.isConnected()) {
        Serial.println("❌ Không kết nối Wi-Fi. Dừng chương trình.");
        while (true) {
            delay(1000);
        }
    }

    // ---- 2. Khởi tạo camera ----
    if (!cameraModule.init()) {
        Serial.println("❌ Khởi tạo camera thất bại. Dừng chương trình.");
        while (true) {
            delay(1000);
        }
    }

    // ---- 3. Cấu hình HttpModule (nếu muốn thay timeout) ----
    httpModule.setTimeout(8000); // chờ tối đa 8s khi đọc response

    Serial.println("🚀 Ready to capture and upload!");
}

void loop() {
    // ---- 4. Chụp ảnh ----
    camera_fb_t* fb = cameraModule.capture();
    if (fb) {
        // ---- 5. Gửi ảnh lên server ----
        bool ok = httpModule.send(fb);
        if (!ok) {
            Serial.println("❌ Gửi ảnh thất bại");
        }
        // ---- 6. Giải phóng buffer ----
        cameraModule.release(fb);
    } else {
        Serial.println("❌ Không lấy được frame để gửi");
    }

    // ---- 7. Đợi trước khi chụp tiếp ----
    Serial.printf("⏱️ Đợi %lums trước khi chụp lại...\n", UPLOAD_INTERVAL);
    delay(UPLOAD_INTERVAL);
}
