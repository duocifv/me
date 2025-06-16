#include "CameraService.h"

void CameraService::prepareConfig() {
    // AI Thinker ESP32-CAM pinout mapping
    config_.pin_pwdn     = 32;
    config_.pin_reset    = -1; // Not connected
    config_.pin_xclk     = 0;
    config_.pin_sccb_sda = 26;
    config_.pin_sccb_scl = 27;

    config_.pin_d7       = 35;
    config_.pin_d6       = 34;
    config_.pin_d5       = 39;
    config_.pin_d4       = 36;
    config_.pin_d3       = 21;
    config_.pin_d2       = 19;
    config_.pin_d1       = 18;
    config_.pin_d0       = 5;

    config_.pin_vsync    = 25;
    config_.pin_href     = 23;
    config_.pin_pclk     = 22;

    config_.xclk_freq_hz = 20000000;
    config_.ledc_timer   = LEDC_TIMER_0;
    config_.ledc_channel = LEDC_CHANNEL_0;

    config_.pixel_format = PIXFORMAT_JPEG;

    config_.frame_size   = FRAMESIZE_SVGA;  // 800x600
    config_.jpeg_quality = 12;              // Lower = higher quality, 0–63
    config_.fb_count     = 1;
}

bool CameraService::setup() {
    prepareConfig();
    esp_err_t err = esp_camera_init(&config_);
    if (err != ESP_OK) {
        Serial.printf("[CameraService] ❌ Camera init failed (0x%x)\n", err);
        initialized_ = false;
    } else {
        initialized_ = true;
        Serial.println("[CameraService] ✅ Camera initialized successfully");
    }
    return initialized_;
}

camera_fb_t* CameraService::captureImage() {
    if (!initialized_) {
        Serial.println("[CameraService] ⚠️ Attempted capture before initialization");
        return nullptr;
    }

    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("[CameraService] ❌ Failed to get frame buffer");
        return nullptr;
    }

    return fb;
}

void CameraService::deinit() {
    if (initialized_) {
        esp_camera_deinit();
        initialized_ = false;
        Serial.println("[CameraService] 📷 Camera deinitialized");
    }
}
