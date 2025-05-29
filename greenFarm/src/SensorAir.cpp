#include "SensorAir.h"
#include <Arduino.h>

// Giả lập đọc cảm biến
void SensorAir::setup() {
    // Nếu có thư viện cảm biến thật thì init ở đây
}

void SensorAir::read(float& temperature, float& humidity) {
    // Thay bằng đọc cảm biến thật
    temperature = 25.0 + random(-50, 50) / 10.0;  // giả lập nhiệt độ 20-30°C
    humidity = 55.0 + random(-10, 10);            // giả lập độ ẩm 45-65%
}
