#include <Arduino.h>
#include "config.h"
#include "WiFiService.h"
#include "SensorAir.h"
#include "SensorWater.h"
#include "CameraService.h"
#include "PumpControl.h"
#include "Uploader.h"

WiFiService wifi(WIFI_SSID, WIFI_PASSWORD);
SensorAir air;
SensorWater water;
CameraService camera;
PumpControl pump;
Uploader uploader(SERVER_HOST, SERVER_PORT, DEVICE_TOKEN, DEVICE_ID);

unsigned long lastMillis = 0;

void setup() {
  Serial.begin(115200);
  wifi.connect();
  air.setup();
  water.setup();
  camera.setup();
  pump.setup();
}

void loop() {
  if (millis() - lastMillis > LOOP_INTERVAL_MS) {
    lastMillis = millis();

    float t, h, wt;
    air.read(t, h);
    wt = water.readTemperature();

    // Gửi cảm biến
    uploader.sendSensorData(t, h, wt);

    // Chụp và gửi ảnh
    uint8_t* imgBuf;
    size_t imgLen;
    if (camera.captureImage(imgBuf, imgLen)) {
      uploader.sendImage(imgBuf, imgLen);
      esp_camera_fb_return((camera_fb_t*)imgBuf);
    } else {
      Serial.println("❌ Failed to capture image");
    }

    // Điều khiển bơm
    if (h < 60 || wt > 30) pump.on();
    else pump.off();
  }
}
