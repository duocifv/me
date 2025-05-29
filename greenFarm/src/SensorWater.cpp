#include "SensorWater.h"
#include <Arduino.h>

void SensorWater::setup() {
    // Khởi tạo cảm biến nước nếu cần
}

float SensorWater::readTemperature() {
    // Giả lập, thay bằng đọc cảm biến thật
    return 28.0 + random(-20, 20) / 10.0;  // 26-30°C
}
