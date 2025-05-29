#include "CameraService.h"

void CameraService::prepareConfig() {
    // AI-Thinker ESP32-CAM breakout pin mapping
    config_.pin_pwdn     = 32;
    config_.pin_reset    = -1;
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
    config_.frame_size   = FRAMESIZE_SVGA;  // adjust as needed
    config_.jpeg_quality = 12;              // 0-63 lower means higher quality
    config_.fb_count     = 1;
}

bool CameraService::setup() {
    prepareConfig();
    esp_err_t err = esp_camera_init(&config_);
    if (err != ESP_OK) {
        Serial.printf("[CameraService] Camera init failed with error 0x%x\n", err);
        initialized_ = false;
    } else {
        initialized_ = true;
    }
    return initialized_;
}

// Returns the frame buffer; caller is responsible for esp_camera_fb_return()
camera_fb_t* CameraService::captureImage() {
    if (!initialized_) {
        Serial.println("[CameraService] captureImage called before init");
        return nullptr;
    }

    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("[CameraService] Frame buffer capture failed");
        return nullptr;
    }

    return fb;
}

void CameraService::deinit() {
    if (initialized_) {
        esp_camera_deinit();
        initialized_ = false;
    }
}