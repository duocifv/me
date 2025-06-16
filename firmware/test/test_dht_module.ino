#include "dht_module.h"

#define LED_PIN 4

DHTModule dht;

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

  Serial.println("🚀 Khởi động cảm biến DHT...");
  dht.begin();
}

void loop() {
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

  delay(1000);
}
