#include "dht_module.h"

#define LED_PIN 2  // GPIO 2 (trên nhiều board là LED tích hợp)

DHTModule dht;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("=== Test DHTModule với LED báo trạng thái ===");

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  dht.begin();
}

void loop() {
  dht.update();

  if (dht.hasData()) {
    Serial.print("✅ Nhiệt độ: ");
    Serial.print(dht.getTemperature());
    Serial.print(" °C |  💧 Độ ẩm: ");
    Serial.print(dht.getHumidity());
    Serial.println(" %");

    // Nháy nhanh: thành công
    for (int i = 0; i < 3; i++) {
      digitalWrite(LED_PIN, HIGH);
      delay(100);
      digitalWrite(LED_PIN, LOW);
      delay(100);
    }

  } else {
    Serial.println("❌ Không lấy được dữ liệu từ DHT22");

    // Nháy chậm: lỗi
    for (int i = 0; i < 3; i++) {
      digitalWrite(LED_PIN, HIGH);
      delay(600);
      digitalWrite(LED_PIN, LOW);
      delay(600);
    }
  }

  delay(3000);  // chờ trước vòng lặp kế tiếp
}
