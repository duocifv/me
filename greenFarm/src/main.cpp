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

constexpr int RELAY_PIN = 5;

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
int wifiFailureCount = 0;

void startCycle();

bool isWifiConnected();
bool readSensors();
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
  unsigned long now = millis();
  // Bắt đầu chu kỳ mới nếu đến thời gian
  if (now - lastCycleMillis >= CYCLE_INTERVAL_MS)
  {
    lastCycleMillis = now;
    startCycle();
  }

  // Tắt relay khi hết thời gian bật
  if (relayOnMillis != 0 && (now - relayOnMillis >= RELAY_ON_DURATION_MS))
  {
    relayOff();
  }
}

void startCycle()
{
  Serial.println("\n=== 🌱 Start new cycle ===");

  // 1. Đọc cảm biến, nếu thất bại thì bỏ qua
  if (!readSensors())
  {
    Serial.println("⚠ Bỏ qua vòng gửi do cảm biến lỗi.");
    return;
  }

  // 2. Kiểm tra WiFi
  if (!isWifiConnected())
  {
    Serial.println("❌ Bỏ qua vòng gửi do WiFi không sẵn sàng.");
    return;
  }

  // 3. Xây dựng JSON và gửi API
  buildAndSendJson();
}

bool isWifiConnected()
{
  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("✅ WiFi OK.");
    wifiFailureCount = 0; // reset số lần thất bại
    return true;
  }

  Serial.println("⚠ WiFi mất kết nối, thử lại...");
  wifi.connect();

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 5000)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("✅ WiFi kết nối lại thành công.");
    wifiFailureCount = 0; // reset nếu kết nối được
    return true;
  }
  else
  {
    Serial.println("❌ WiFi kết nối lại thất bại.");
    wifiFailureCount++; // tăng số lần thất bại
    return false;
  }
}

bool readSensors()
{
  ambientTemp = dht.getTemperature();
  humidity = dht.getHumidity();
  waterTemp = ds18b20.getTemperature();

  if (isnan(ambientTemp) || isnan(humidity) || isnan(waterTemp))
  {
    return false; // lỗi cảm biến
  }

  Serial.printf("🌡 Ambient: %.2f°C  💧 Humidity: %.2f%%  💧 Water: %.2f°C\n",
                ambientTemp, humidity, waterTemp);
  return true; // cảm biến hợp lệ
}

void buildAndSendJson()
{
  const int maxRetries = 3;              // Số lần thử gửi tối đa
  const unsigned long retryDelay = 1000; // Delay giữa các lần thử (ms)

  unsigned long t0 = millis();
  jsonLen = buildJsonSnapshots(jsonBuf, sizeof(jsonBuf),
                               waterTemp, ambientTemp,
                               humidity, 6.50, 1.20, 250);
  Serial.printf("📦 Payload JSON (%d bytes): %s\n", jsonLen, jsonBuf);
  unsigned long t1 = millis();
  Serial.printf("🛠 JSON build: %lums\n", t1 - t0);

  bool success = false;
  for (int attempt = 1; attempt <= maxRetries; attempt++)
  {
    unsigned long t2 = millis();
    success = api.sendData(jsonBuf, jsonLen);

    unsigned long t3 = millis();

    Serial.printf("📤 Gửi lần %d mất %lums\n", attempt, t3 - t2);
    if (success)
    {
      Serial.println("✅ Gửi thành công!");
      break;
    }
    else
    {
      Serial.println("❌ Gửi thất bại.");
      if (attempt < maxRetries)
      {
        Serial.printf("⏳ Đợi %lums trước khi thử lại...\n", retryDelay);
        delay(retryDelay);
      }
    }
  }

  if (success)
  {
    relayOn();
  }
  else
  {
    Serial.println("Relay sẽ không bật do gửi dữ liệu thất bại sau nhiều lần thử.");
  }
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
