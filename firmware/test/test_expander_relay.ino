#include <Arduino.h>
#include "expander_relay.h"

// Khởi tạo relay dùng chân P0, P1, P2
ExpanderRelay relay1(0);
ExpanderRelay relay2(1);
ExpanderRelay relay3(2);

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
  delay(500);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.println("🚀 Khởi động PCF8574...");

  if (ExpanderRelay::beginBus()) {
    Serial.println("✅ PCF8574 kết nối thành công.");
    relay1.off();
    relay2.off();
    relay3.off();
    blinkLED(1, 200);
  } else {
    Serial.println("❌ Lỗi kết nối PCF8574.");
    blinkLED(3, 200);
    while (true);
  }
}

void loop() {
  Serial.println("🔁 Bật relay 1");
  relay1.on();
  delay(1000);

  Serial.println("🔁 Bật relay 2");
  relay2.on();
  delay(1000);

  Serial.println("🔁 Bật relay 3");
  relay3.on();
  delay(1000);

  Serial.println("🛑 Tắt tất cả relay");
  relay1.off();
  relay2.off();
  relay3.off();
  delay(2000);
}
