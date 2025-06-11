#include <Wire.h>
#include "PCF8574.h"

#define SDA_PIN 2
#define SCL_PIN 14

PCF8574 pcf(0x20); // thay 0x20 nếu địa chỉ khác (xem bên dưới)

void setup() {
  Serial.begin(115200);

  // Khởi tạo I2C với chân tùy chỉnh
  Wire.begin(SDA_PIN, SCL_PIN);

  // Khởi động PCF8574
  if (pcf.begin()) {
    Serial.println("PCF8574 đã kết nối.");
  } else {
    Serial.println("Không tìm thấy PCF8574!");
    while (1); // Dừng luôn nếu không kết nối được
  }

  // Bật relay (LOW thường là bật)
  pcf.write(0, LOW);
}

void loop() {
  // Tắt relay
  pcf.write(0, HIGH);
  delay(1000);

  // Bật relay
  pcf.write(0, LOW);
  delay(1000);
}
