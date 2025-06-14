#include <Arduino.h>
#include "expander_relay.h"

// Khởi tạo relay tại chân P0 của PCF8574
ExpanderRelay relay1(0);

// LED trạng thái (có thể dùng đèn board hoặc gắn ngoài)
#define LED_PIN 4

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
  delay(1000);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.println("🚀 Bắt đầu khởi động PCF8574...");

  // Khởi tạo relay1 và kiểm tra kết nối
  bool ok = relay1.begin();

  if (ok) {
    Serial.println("✅ PCF8574 kết nối thành công.");

    // Tắt relay để tránh bật ngẫu nhiên lúc khởi động
    relay1.off();

    blinkLED(1, 200); // báo hiệu OK
  } else {
    Serial.println("❌ Lỗi kết nối PCF8574.");
    blinkLED(3, 200); // báo hiệu lỗi
    while (true); // Dừng chương trình
  }
}

void loop() {
  Serial.println("🔁 Bật relay...");
  relay1.on();
  delay(1000);

  Serial.println("🛑 Tắt relay...");
  relay1.off();
  delay(1000);
}
