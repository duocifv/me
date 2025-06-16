#ifndef CAMERA_MODULE_H
#define CAMERA_MODULE_H

#include "esp_camera.h"
#include <Arduino.h>

/*
  CameraModule chịu trách nhiệm:
   - Khởi tạo camera ESP32-CAM
   - Chụp ảnh JPEG và trả về pointer camera_fb_t*
   - Giải phóng buffer khi đã sử dụng xong
*/

class CameraModule {
public:
    CameraModule() {}

    // Khởi tạo camera. Trả về true nếu thành công, false nếu lỗi.
    bool init() {
        camera_config_t config = {
            .pin_pwdn       = PWDN_GPIO_NUM,
            .pin_reset      = RESET_GPIO_NUM,
            .pin_xclk       = XCLK_GPIO_NUM,
            .pin_sccb_sda   = SIOD_GPIO_NUM,
            .pin_sccb_scl   = SIOC_GPIO_NUM,
            .pin_d7         = Y9_GPIO_NUM,
            .pin_d6         = Y8_GPIO_NUM,
            .pin_d5         = Y7_GPIO_NUM,
            .pin_d4         = Y6_GPIO_NUM,
            .pin_d3         = Y5_GPIO_NUM,
            .pin_d2         = Y4_GPIO_NUM,
            .pin_d1         = Y3_GPIO_NUM,
            .pin_d0         = Y2_GPIO_NUM,
            .pin_vsync      = VSYNC_GPIO_NUM,
            .pin_href       = HREF_GPIO_NUM,
            .pin_pclk       = PCLK_GPIO_NUM,
            .xclk_freq_hz   = 20000000,
            .ledc_timer     = LEDC_TIMER_0,
            .ledc_channel   = LEDC_CHANNEL_0,
            .pixel_format   = PIXFORMAT_JPEG,

            // Điều chỉnh độ phân giải và JPEG quality để giảm dung lượng
            .frame_size     = FRAMESIZE_QVGA,  // 320×240
            .jpeg_quality   = 12,              // từ 12–15 để file ~30–50 KB
            .fb_count       = 1
        };

        // Nếu board có PSRAM (ví dụ WROVER), bật để buffer nằm ở PSRAM
        #ifdef CONFIG_SPIRAM_SUPPORT
          config.fb_location = CAMERA_FB_IN_PSRAM;
        #endif

        esp_err_t err = esp_camera_init(&config);
        if (err != ESP_OK) {
            Serial.printf("❌ Lỗi khởi tạo camera: 0x%x\n", err);
            return false;
        }
        Serial.println("✅ Camera đã khởi tạo thành công");
        return true;
    }

    // Chụp một tấm ảnh. Nếu thành công, trả về pointer camera_fb_t* chứa data JPEG.
    // Nếu lỗi, trả về nullptr.
    camera_fb_t* capture() {
        camera_fb_t* fb = esp_camera_fb_get();
        if (!fb) {
            Serial.println("❌ Lỗi chụp ảnh: fb == nullptr");
            return nullptr;
        }
        Serial.printf("📸 Đã chụp ảnh: %u bytes\n", (unsigned)fb->len);
        return fb;
    }

    // Giải phóng buffer sau khi đã xử lý xong
    void release(camera_fb_t* fb) {
        if (fb) {
            esp_camera_fb_return(fb);
        }
    }

private:
    // Các define chân GPIO cho module AI-Thinker ESP32-CAM
    static const int PWDN_GPIO_NUM   = 32;
    static const int RESET_GPIO_NUM  = -1;
    static const int XCLK_GPIO_NUM   = 0;
    static const int SIOD_GPIO_NUM   = 26;
    static const int SIOC_GPIO_NUM   = 27;
    static const int Y9_GPIO_NUM     = 35;
    static const int Y8_GPIO_NUM     = 34;
    static const int Y7_GPIO_NUM     = 39;
    static const int Y6_GPIO_NUM     = 36;
    static const int Y5_GPIO_NUM     = 21;
    static const int Y4_GPIO_NUM     = 19;
    static const int Y3_GPIO_NUM     = 18;
    static const int Y2_GPIO_NUM     = 5;
    static const int VSYNC_GPIO_NUM  = 25;
    static const int HREF_GPIO_NUM   = 23;
    static const int PCLK_GPIO_NUM   = 22;
};

#endif // CAMERA_MODULE_H
