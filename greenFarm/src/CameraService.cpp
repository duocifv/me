#include "CameraService.h"
#include <Arduino.h>

void CameraService::setup() {
    Serial.println("📷 Camera sẵn sàng (giả lập)");
}

void CameraService::captureImage() {
    Serial.println("📸 Đã chụp hình (giả lập)");
}
