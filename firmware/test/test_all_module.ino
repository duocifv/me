#include <Arduino.h>
#include "ds18b20_module.h"
#include "expander_relay.h"

#define LED_PIN 4  // LED báo trạng thái (đèn flash của ESP32-CAM)

// Khởi tạo module DS18B20
DS18B20Module tempSensor;

// Khởi tạo 3 relay gắn vào chân P0, P1, P2 của PCF8574 dùng chung
ExpanderRelay relay1(0);
ExpanderRelay relay2(1);
ExpanderRelay relay3(2);

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
  delay(2000);  // Chờ hệ thống ổn định

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Khởi động DS18B20
  Serial.println("🚀 Khởi động cảm biến DS18B20...");
  tempSensor.begin();
  if (!tempSensor.isFound()) {
    Serial.println("❌ Không tìm thấy cảm biến DS18B20!");
    blinkLED(3, 200);
    while (true);  // Dừng chương trình
  } else {
    Serial.println("✅ Cảm biến DS18B20 đã sẵn sàng");
    blinkLED(1, 100);  // Báo hiệu sẵn sàng
  }

  // Khởi động bus I2C và PCF8574 dùng chung cho relay
  Serial.println("🚀 Khởi động PCF8574...");
  if (ExpanderRelay::beginBus()) {
    Serial.println("✅ PCF8574 kết nối thành công.");
    // Tắt tất cả relay ban đầu
    relay1.off();
    relay2.off();
    relay3.off();
  } else {
    Serial.println("❌ Lỗi kết nối PCF8574.");
    blinkLED(2, 200);
    while (true);
  }
}

void loop() {
  // Đo nhiệt độ DS18B20
  float temp = tempSensor.getTemperature();
  delay(100);  // Cho thư viện xử lý
  if (!isnan(temp)) {
    Serial.print("🌡️ Nhiệt độ: ");
    Serial.print(temp);
    Serial.println(" °C");
    blinkLED(1, 200);  // Nháy 1 lần khi đọc thành công
  } else {
    Serial.println("❌ Không đọc được dữ liệu từ DS18B20");
    blinkLED(3, 200);  // Nháy 3 lần khi lỗi
  }
  
  // Chuỗi điều khiển relay:
  Serial.println("🔁 Bắt đầu chu trình relay...");
  relay1.on();
  delay(1000);
  
  relay2.on();
  delay(1000);
  
  relay3.on();
  delay(1000);
  
  Serial.println("🛑 Tắt tất cả relay");
  relay1.off();
  relay2.off();
  relay3.off();
  delay(2000);

  // Thực hiện đo nhiệt độ mỗi 3 giây (với chu kỳ relay kéo dài thêm ~5 giây => tổng ~8 giây/lần)
}
