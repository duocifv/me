#include <Arduino.h>
#include "wifi_module.h"
#include "api_module.h"
#include "dht_module.h"
#include "ds18b20_module.h"
#include "json_builder.h"
#include "relay_module.h"
#include <WiFi.h>

const char *ssid = "Wokwi-GUEST";
const char *password = "";
const char *apiUrl = "https://my.duocnv.top/v1/hydroponics/snapshots";
const char *deviceToken = "esp32";
const char *deviceId = "device-001";

#define RELAY_PIN 5

RelayModule fan(RELAY_PIN);
WifiModule wifi(ssid, password);
ApiModule api(apiUrl, deviceToken, deviceId);
DHTModule dht;
DS18B20Module ds18b20;

static char jsonBuf[256];
float ambientTemp, humidity, waterTemp;
size_t jsonLen;

const unsigned long RELAY_ON_DURATION_MS = 2000;
const unsigned long CYCLE_INTERVAL_MS = 30000;

unsigned long relayOnMillis = 0;
unsigned long lastCycleMillis = 0;

void startCycle();

void ensureWifi();
void readSensors();
void buildAndSendJson();
void relayOn();
void relayOff();
void endConnection();

void setup()
{
  Serial.begin(115200);
  delay(500);
  wifi.connect();
  dht.begin();
  ds18b20.begin();
  ds18b20.setResolution(12);
  api.begin();

  lastCycleMillis = millis();
  startCycle();
}

void loop()
{
  // check if time for next cycle
  if (millis() - lastCycleMillis >= CYCLE_INTERVAL_MS)
  {
    lastCycleMillis = millis();
    startCycle();
  }

  // handle relay timing
  if (relayOnMillis > 0 && (millis() - relayOnMillis >= RELAY_ON_DURATION_MS))
  {
    relayOff();
  }
}

void startCycle()
{
  Serial.println("\n=== 🌱 Start new cycle ===");
  ensureWifi();
}

void ensureWifi()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("⚠ WiFi mất kết nối, thử lại...");
    wifi.connect();
    delay(1000); // ngắn cho kịp reconnect
    if (WiFi.status() != WL_CONNECTED)
    {
      Serial.println("❌ Bỏ qua vòng gửi do WiFi.");
      return; // bỏ qua vòng này
    }
  }
  Serial.println("✅ WiFi OK.");
  readSensors();
}

void readSensors()
{
  ambientTemp = dht.getTemperature();
  humidity = dht.getHumidity();
  waterTemp = ds18b20.getTemperature();
  Serial.printf("🌡 Ambient: %.2f°C  💧 Humidity: %.2f%%  💧 Water: %.2f°C\n",
                ambientTemp, humidity, waterTemp);
  buildAndSendJson();
}

void buildAndSendJson()
{
  unsigned long t0 = millis();
  jsonLen = buildJsonSnapshots(jsonBuf, sizeof(jsonBuf),
                               waterTemp, ambientTemp,
                               humidity, 6.50, 1.20, 250);
  unsigned long t1 = millis();
  Serial.printf("🛠 JSON build: %lums\n", t1 - t0);

  unsigned long t2 = millis();
  bool success = api.sendData(jsonBuf, jsonLen);
  unsigned long t3 = millis();
  Serial.printf("📤 Gửi mất %lums\n", t3 - t2);
  Serial.println(success ? "✅ Gửi thành công!" : "❌ Gửi thất bại.");

  relayOn();
}

void relayOn()
{
  fan.turnOn();
  Serial.println("🔌 Relay ON");
  relayOnMillis = millis(); // bắt đầu đếm thời gian relay
}

void relayOff()
{
  fan.turnOff();
  Serial.println("🔌 Relay OFF");
  relayOnMillis = 0; // reset timer
  endConnection();
}

void endConnection()
{
  api.endConnection();
  Serial.println("✅ Kết thúc vòng gửi.\n");
}
