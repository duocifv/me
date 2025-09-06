#include <Arduino.h>
#include "config.h"

#include "wifi_module.h"
#include "mqtt_module.h"
#include "relay_module.h"
#include "dht_module.h"
#include "ds18b20_module.h"

// ==== Modules ====
WifiModule wifi(WIFI_SSID, WIFI_PASS);
MQTTModule mqtt;
DHTModule dht(PIN_DHT);
DS18B20Module ds18(PIN_DS18);

// ==== Báo lỗi ====
float reportError(const char *msg) {
  mqtt.publishError(msg);
  Serial.println(msg);
  return NAN;  // vẫn trả về số cho JSON (NaN được Json coi như null)
}

// ==== MQTT callback ====
void mqttCallback(char *topic, uint8_t *payload, unsigned int length) {
  Serial.printf("📩 MQTT [%s]: ", topic);

  char buf[256];
  if (length >= sizeof(buf)) length = sizeof(buf) - 1;
  memcpy(buf, payload, length);
  buf[length] = '\0';
  Serial.println(buf);

  StaticJsonDocument<256> doc;
  if (deserializeJson(doc, buf)) {
    Serial.println("❌ JSON parse failed");
    return;
  }

  // Chỉ xử lý topic esp32/control
  if (strcmp(topic, "esp32/control") == 0) {
    // ==== Relay control ====
    if (doc.containsKey("fanCool")) relaySet(RELAY_FAN_COOL, doc["fanCool"]);
    if (doc.containsKey("fanVent")) relaySet(RELAY_FAN_VENT, doc["fanVent"]);
    if (doc.containsKey("led")) relaySet(RELAY_LED, doc["led"]);
    if (doc.containsKey("pump")) relaySet(RELAY_PUMP, doc["pump"]);

    // ==== Sensor request ====
    if (doc["sensors"] == true) {
      // Kiểm tra kết nối WiFi và MQTT
      if (WiFi.status() == WL_CONNECTED && mqtt.isConnected()) {
        dht.update();
        float waterTemp = ds18.getTemperature();
        float airTemp = dht.available() ? dht.getTemperature() : reportError("airTemp:no data");
        float hum = dht.available() ? dht.getHumidity() : reportError("humidity:no data");

        mqtt.publishSensor(waterTemp, airTemp, hum);
      } else {
        Serial.println(F("[WARN] WiFi/MQTT not connected -> skip sensor read"));
      }
    }
  }

  Serial.println("✅ Relays updated from MQTT");
  mqtt.publishPing();
}

// ==== setup ====
void setup() {
  Serial.begin(115200);
  delay(100);

  wifi.connect();
  relayBegin(RELAY_FAN_COOL, RELAY_FAN_VENT, RELAY_LED, RELAY_PUMP);

  dht.begin();
  ds18.begin();

  mqtt.begin(mqttCallback);
}

// ==== loop ====
void loop() {
  wifi.loop();
  mqtt.loop();

  bool online = wifi.isConnected() && mqtt.isConnected();

  if (!online) {
    // Nếu mất WiFi hoặc MQTT thì tắt hết relay
    relaySet(RELAY_FAN_COOL, LOW);
    relaySet(RELAY_FAN_VENT, LOW);
    relaySet(RELAY_LED, LOW);
    relaySet(RELAY_PUMP, LOW);

    // Báo lỗi cảm biến
    Serial.println("⚠️ Offline: sensor data not published");
  }
}
