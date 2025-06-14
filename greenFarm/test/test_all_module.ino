#include <Arduino.h>
#include "expander_relay.h"
#include "ds18b20_module.h"
#include "dht_module.h"

// Khởi tạo relay tại chân P0 của PCF8574
ExpanderRelay relay1(0);
DS18B20Module tempSensor;
DHTModule dht;

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
  delay(2000);

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

  Serial.println("🚀 Khởi động cảm biến DS18B20...");
  tempSensor.begin();

  Serial.println("🚀 Khởi động cảm biến DHT...");
  dht.begin();
}

void loop() {
  Serial.println("🔁 Bật relay...");
  relay1.on();
  delay(1000);

  Serial.println("🛑 Tắt relay...");
  relay1.off();
  delay(10000);

  dht.update();

  if (dht.hasData()) {
    float t = dht.getTemperature();
    float h = dht.getHumidity();

    Serial.print("✅ Temp: ");
    Serial.print(t);
    Serial.print(" °C | 💧 Humidity: ");
    Serial.print(h);
    Serial.println(" %");

    blinkLED(1, 200);
  } else {
    blinkLED(3, 200);
  }

  delay(10000);


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

  delay(10000);
}
