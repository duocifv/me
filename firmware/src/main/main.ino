#include <Arduino.h>
#include <ArduinoJson.h>
#include "wifi_module.h"
#include "mqtt_module.h"
#include "expander_relay.h"
#include "config.h"
#include "ds18b20_module.h"
#include "camera_module.h"
#include "led_indicator.h"

WifiModule wifi(ssid, password);
MQTTModule mqtt; 

ExpanderRelay fanRelay(0);
ExpanderRelay ledRelay(1);
ExpanderRelay pumpRelay(2);

DS18B20Module tempSensor;
CameraModule cameraModule;
LedIndicator led;

float ambientTemp = 0, humidity = 0, waterTemp = 0;
unsigned long sensorPrev = 0, cameraPrev = 0;

bool initRelays() {
  if (!ExpanderRelay::beginBus()) {
    led.blink(3, 200);
    return false;
  }
  fanRelay.off();
  ledRelay.off();
  pumpRelay.off();
  return true;
}

bool initSensors() {
  tempSensor.begin();
  return tempSensor.isFound();
}

bool initCamera() {
  return cameraModule.init();
}

void reportError(const char* msg) {
  mqtt.publish("esp32/errors", msg);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) {
    reportError("Invalid JSON from screen");
    return;
  }

  if (String(topic) == "esp32/screen") {
    fanRelay.set(doc["fanOn"] | false);
    ledRelay.set(doc["ledOn"] | false);
    pumpRelay.set(doc["pumpOn"] | false);
  }
}

void setup() {
  Serial.begin(115200);
  delay(2000);

  if (!wifi.connect()) {
    led.blink(3, 100);
    delay(2000);
    ESP.restart();
  }

  if (!initRelays()) reportError("PCF8574:no init");
  if (!initSensors()) reportError("DS18B20:no data");
  if (!initCamera()) reportError("Camera:init fail");

  mqtt.begin(MQTT_HOST, MQTT_PORT, mqttCallback);
  mqtt.subscribe("esp32/screen");

  led.blink(1, 400);
}

void loop() {
  mqtt.loop();

  if (millis() - sensorPrev > 5000) {
    sensorPrev = millis();

    float t = tempSensor.getTemperature();
    if (isnan(t)) {
      waterTemp = 0;
      reportError("DS18B20:no data");
    } else {
      waterTemp = t;
    }

    StaticJsonDocument<256> doc;
    doc["waterTemperature"] = waterTemp;
    doc["ambientTemperature"] = ambientTemp;
    doc["humidity"] = humidity;

    char buffer[256];
    size_t len = serializeJson(doc, buffer, sizeof(buffer));
    mqtt.publish("esp32/sensors", buffer, len);
  }

  if (millis() - cameraPrev > 10000) {
    cameraPrev = millis();

    camera_fb_t* fb = cameraModule.capture();
    if (!fb) {
      delay(100);
      fb = cameraModule.capture();
    }

    if (fb) {
      mqtt.publishBinary("esp32/camera", fb->buf, fb->len);
      cameraModule.release(fb);
    } else {
      reportError("Camera:capture fail");
    }
  }

  delay(50);
}
