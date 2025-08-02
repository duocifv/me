#include <Arduino.h>
#include <ArduinoJson.h>
#include "wifi_module.h"
#include "mqtt_module.h"
#include "expander_relay.h"
#include "config.h"
#include "ds18b20_module.h"
#include "camera_module.h"
#include "led_indicator.h"
#include "mbedtls/base64.h"

WifiModule wifi(ssid, password);
MQTTModule mqtt;

ExpanderRelay fanRelay(0);
ExpanderRelay ledRelay(1);
ExpanderRelay pumpRelay(2);

DS18B20Module tempSensor;
CameraModule cameraModule;
LedIndicator led;

unsigned long lastSensor = 0, lastCamera = 0;

bool sensorEnabled = false, cameraEnabled = false;

float ambientTemp = 1, humidity = 1, waterTemp = 1;

unsigned long lastCameraTrigger = 0;             // Thời điểm chụp ảnh gần nhất
const uint32_t CAMERA_COOLDOWN = 5 * 60 * 1000;  // 10 phút (tính bằng ms)


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
  return cameraModule.begin();
}


// global ở đầu file .ino
void reportError(const char *msg) {
  mqtt.publishError(msg);
}


// =======================
// 📩 Xử lý dữ liệu từ MQTT
// =======================
void onMqttMessage(char *topic, byte *payload, unsigned int length) {
  Serial.println("📩 MQTT message received");
  Serial.print("📦 Topic: ");
  Serial.println(topic);
  Serial.print("📦 Raw payload: ");
  Serial.write(payload, length);
  Serial.println();

  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) {
    Serial.print("❌ JSON parse error: ");
    Serial.println(err.c_str());
    return;
  }

  if (strcmp(topic, "esp32/control") == 0) {
    if (doc.containsKey("fanOn")) {
      bool fan = doc["fanOn"];
      fanRelay.set(fan);
      Serial.print("🔧 Fan: ");
      Serial.println(fan ? "ON" : "OFF");
    }
    if (doc.containsKey("ledOn")) {
      bool led = doc["ledOn"];
      ledRelay.set(led);
      Serial.print("🔧 LED: ");
      Serial.println(led ? "ON" : "OFF");
    }
    if (doc.containsKey("pumpOn")) {
      bool pump = doc["pumpOn"];
      pumpRelay.set(pump);
      Serial.print("🔧 Pump: ");
      Serial.println(pump ? "ON" : "OFF");
    }
    if (doc.containsKey("sensor")) {
      sensorEnabled = doc["sensor"];
      Serial.print("🔧 Sensor publish: ");
      Serial.println(sensorEnabled ? "ENABLED" : "DISABLED");
    }
    if (doc.containsKey("camera")) {
      bool cameraTrigger = doc["camera"];

      if (cameraTrigger) {
        unsigned long now = millis();
        if (now - lastCameraTrigger >= CAMERA_COOLDOWN || lastCameraTrigger == 0) {
          Serial.println("📸 Camera trigger received ✅");
          sendCameraImage();        // 👉 Chụp ảnh ngay lập tức
          lastCameraTrigger = now;  // Ghi lại thời điểm chụp
        } else {
          Serial.println("⏱️ Camera trigger IGNORED ❌ (chưa đủ 10 phút)");
        }
      }
    }
  }
  Serial.println("✅ Relays updated from MQTT");
}




void sendSensorData() {

  float t = tempSensor.getTemperature();
  if (isnan(t)) {
    waterTemp = 0;
    reportError("DS18B20:no data");
  } else {
    waterTemp = t;
  }

  mqtt.publishSensorData(waterTemp, ambientTemp, humidity);
  Serial.println("📤 Sensor data sent");
}



void sendCameraImage() {
  camera_fb_t *fb = cameraModule.capture();
  if (!fb) {
    delay(100);
    fb = cameraModule.capture();
  }

  if (!fb) {
    reportError("Camera:capture fail");
    return;
  }

  Serial.printf("📸 Image captured: %d bytes\n", fb->len);

  // 1. Tính kích thước buffer Base64 cần thiết
  size_t raw_len = fb->len;
  size_t b64_len = 0;
  mbedtls_base64_encode(nullptr, 0, &b64_len, fb->buf, raw_len);
  // giờ b64_len chứa độ dài cần cấp phát

  // 2. Cấp phát buffer và encode
  char *b64_buf = (char *)malloc(b64_len + 1);
  if (!b64_buf) {
    reportError("Memory: malloc failed");
    cameraModule.release(fb);
    return;
  }
  if (mbedtls_base64_encode((unsigned char *)b64_buf, b64_len, &b64_len,
                            fb->buf, raw_len)
      != 0) {
    reportError("Base64: encode failed");
    free(b64_buf);
    cameraModule.release(fb);
    return;
  }
  b64_buf[b64_len] = '\0';  // null-terminate

  mqtt.publishCameraImageBase64(b64_buf);

  Serial.println("✅ Camera image (Base64) published");


  // 4. Giải phóng bộ nhớ
  free(b64_buf);
  cameraModule.release(fb);
}

// =======================
// 🔧 Setup
// =======================

void setup() {
  Serial.begin(115200);
  delay(1000);


  // Kết nối Wi-Fi
  Serial.print("WiFi: ");
  // if (!wifi.connect()) {
  //   Serial.println("❌ Failed");
  //   while (true)
  //     delay(1000);
  // }
  if (!wifi.connect()) {
    Serial.println("❌ Failed");
    led.blink(3, 100);
    delay(1000);
    ESP.restart();
  }
  Serial.println("✓ Connected");

  if (!initRelays()) reportError("PCF8574:no init");
  if (!initSensors()) reportError("DS18B20:no data");
  if (!initCamera()) reportError("Camera:init fail");

  mqtt.begin(onMqttMessage);
  mqtt.subscribe("esp32/control");
  Serial.print("Setup ok !!");
}

// =======================
// 🔁 Loop chính
// =======================

void loop() {

  // Duy trì kết nối MQTT
  mqtt.loop();

  if (sensorEnabled && (millis() - lastSensor > SENSOR_INTERVAL)) {
    lastSensor = millis();
    sendSensorData();
  }

  delay(50);
}
