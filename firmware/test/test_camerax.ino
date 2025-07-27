#include <Arduino.h>
#include "camera_module.h"

CameraModule cam;

void setup() {
  Serial.begin(115200);
  delay(1000);

  if (!cam.begin()) {
    Serial.println("Camera failed to initialize!");
    while (true) delay(1000); // Dừng lại
  }
}

void loop() {
  Serial.println("⏳ Capturing image...");
  camera_fb_t *fb = cam.capture();

  if (fb) {
    // Bạn có thể gửi ảnh đi, lưu, hoặc xử lý tại đây
    cam.release(fb);
  }

  delay(5000); // Chụp mỗi 5 giây
}
