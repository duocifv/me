#include <Arduino.h>
#include "ds18b20_module.h"

#define LED_PIN 4 // GPIO4 là đèn flash của ESP32-CAM

DS18B20Module tempSensor;

void blinkLED(int times, int delayMs)
{
  for (int i = 0; i < times; i++)
  {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}

void setup()
{
  Serial.begin(115200);
  delay(2000); // Chờ hệ thống ổn định

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.println("🚀 Khởi động cảm biến DS18B20...");
  tempSensor.begin();

  if (!tempSensor.isFound())
  {
    Serial.println("❌ Không tìm thấy cảm biến!");
    blinkLED(3, 200);
    while (true)
      ; // Dừng chương trình
  }
  else
  {
    Serial.println("✅ Cảm biến DS18B20 đã sẵn sàng");
    blinkLED(1, 100); // Nháy báo sẵn sàng
  }
}

void loop()
{
  float temp = tempSensor.getTemperature();
  delay(100); // Cho thư viện xử lý

  if (!isnan(temp))
  {
    Serial.print("🌡️ Nhiệt độ: ");
    Serial.print(temp);
    Serial.println(" °C");
    blinkLED(1, 200); // ✅ Nháy 1 lần khi thành công
  }
  else
  {
    Serial.println("❌ Không đọc được dữ liệu từ DS18B20");
    blinkLED(3, 200); // ❌ Nháy 3 lần khi lỗi
  }

  delay(3000); // Mỗi 3 giây đo lại
}
