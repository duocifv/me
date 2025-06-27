#include <Arduino.h>
#include "ds18b20_module.h"

#define LED_PIN 4  // Bạn có thể đổi GPIO phù hợp với board

DS18B20Module tempSensor;

// Hàm nháy LED
void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}

void setup() {
  Serial.begin(115200);
  delay(2000);  // Cho chip ổn định

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.println("🚀 Khởi động cảm biến DS18B20...");
  tempSensor.begin();
}

void loop() {
  float temp = tempSensor.getTemperature();

  if (!isnan(temp)) {
    Serial.print("🌡️ Nhiệt độ: ");
    Serial.print(temp);
    Serial.println(" °C");

    blinkLED(1, 200);  // ✅ Nháy 1 lần khi đọc thành công
  } else {
    Serial.println("❌ Không đọc được dữ liệu từ DS18B20");
    blinkLED(3, 200);  // ❌ Nháy 3 lần khi lỗi
  }

  delay(3000);
}
