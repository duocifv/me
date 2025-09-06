#include <Arduino.h>
#include "config.h"

#include "wifi_module.h"
#include "mqtt_module.h"
#include "relay_module.h"
#include "dht_module.h"
#include "ds18b20_module.h"

// ==== Relay pins ====
#define RELAY_FAN_COOL D1
#define RELAY_FAN_VENT D2
#define RELAY_LED      D5
#define RELAY_PUMP     D6

// ==== Modules ====
WifiModule wifi(WIFI_SSID, WIFI_PASS);
MQTTModule mqtt;
DHTModule dht(D4);       // ví dụ DHT22 nối chân D4
DS18B20Module ds18(D3);  // ví dụ DS18B20 nối chân D3

float reportError(const char *msg) {
  mqtt.publishError(msg);
  Serial.println(msg);
  return NAN;   // để gán được cho float
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
    if (doc.containsKey("led"))     relaySet(RELAY_LED, doc["led"]);
    if (doc.containsKey("pump"))    relaySet(RELAY_PUMP, doc["pump"]);

    // ==== Sensor request ====
    if (doc.containsKey("sensors") && doc["sensors"] == true) {
      dht.update();
      float waterTemp = ds18.getTemperature();
      float airTemp   = dht.available() ? dht.getTemperature() : reportError("getTemperature:no data");
      float hum       = dht.available() ? dht.getHumidity()    : reportError("getTemperature:no data");

      // publish sensor vào đúng topic esp32/control
      mqtt.publishSensor(waterTemp, airTemp, hum);
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
}
