#include <Arduino.h>
#include <ArduinoJson.h>
#include "wifi_module.h"
#include "mqtt_module.h"
#include "expander_relay.h"
#include "config.h"
#include "ds18b20_module.h"
#include "camera_module.h"  // Module chuẩn đã gom
#include "led_indicator.h"

WifiModule wifi(ssid, password);
MQTTModule mqtt;

ExpanderRelay fanRelay(0);
ExpanderRelay ledRelay(1);
ExpanderRelay pumpRelay(2);

DS18B20Module tempSensor;
CameraModule cameraModule;  // ✅ Sử dụng đúng kiểu đã định nghĩa
LedIndicator led;

float ambientTemp = 1, humidity = 1, waterTemp = 1;
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
  return cameraModule.begin();  // ✅ Gọi đúng hàm begin() trong CameraModule
}

void reportError(const char* msg) {
  Serial.print("⚠️  MQTT Error: ");
  Serial.println(msg);
  mqtt.publish("esp32/errors", msg, strlen(msg));
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String t = String(topic);
  String payloadStr;

  for (unsigned int i = 0; i < length; i++) {
    payloadStr += (char)payload[i];
  }

  Serial.print("[DEBUG] Payload nhận được: ");
  Serial.println(payloadStr);

  // Chỉ xử lý JSON nếu là topic "esp32/screen"
  if (t == "esp32/screen") {
    if (!payloadStr.startsWith("{")) {
      reportError("❌ JSON lỗi: không parse được (không bắt đầu bằng '{')");
      return;
    }

    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, payloadStr);
    if (err) {
      reportError("❌ JSON lỗi: không parse được");
      return;
    }

    if (doc.containsKey("fanOn")) fanRelay.set(doc["fanOn"]);
    if (doc.containsKey("ledOn")) ledRelay.set(doc["ledOn"]);
    if (doc.containsKey("pumpOn")) pumpRelay.set(doc["pumpOn"]);
  }

  // Bạn có thể thêm xử lý các topic khác nếu cần ở đây
}



void sendSensorData() {
  float t = tempSensor.getTemperature();
  if (isnan(t)) {
    waterTemp = 10;
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

  Serial.println("📤 Sending sensor data via MQTT:");
  Serial.println(buffer);

  if (!mqtt.publish("esp32/sensors", buffer, len)) {
    reportError("MQTT: Failed to publish sensor data");
  } else {
    Serial.println("✅ Sensor data published");
  }
}

void sendCameraImage() {
  camera_fb_t* fb = cameraModule.capture();
  if (!fb) {
    delay(100);
    fb = cameraModule.capture();
  }

  if (fb) {
    Serial.printf("📸 Image captured: %d bytes\n", fb->len);
    if (!mqtt.publishBinary("esp32/camera", fb->buf, fb->len)) {
      reportError("MQTT: Failed to publish camera image");
    } else {
      Serial.println("✅ Camera image published");
    }
    cameraModule.release(fb);
  } else {
    reportError("Camera:capture fail");
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
    sendSensorData();
  }

  if (millis() - cameraPrev > 10000) {
    cameraPrev = millis();
    sendCameraImage();
  }

  delay(50);
}
