#include <Arduino.h>
#include "PumpControl.h"
#include "SensorAir.h"
#include "SensorWater.h"
#include "CameraService.h"
#include "WiFiService.h"
#include "config.h"

PumpControl pump;
SensorAir airSensor;
SensorWater waterSensor;
CameraService camera;


WiFiService wifi(WIFI_SSID, WIFI_PASSWORD);

void setup() {
    Serial.begin(115200);

    wifi.connect();

    pump.setup();
    airSensor.setup();
    waterSensor.setup();
    camera.setup();
}

void loop() {
    float airTemp, airHumid;
    airSensor.read(airTemp, airHumid);

    float waterTemp = waterSensor.readTemperature();

    Serial.printf("[Dữ liệu] Nhiệt độ không khí: %.2f°C | Độ ẩm: %.2f%% | Nhiệt độ nước: %.2f°C\n",
                  airTemp, airHumid, waterTemp);

    if (airHumid < 60 || waterTemp > 30) {
        pump.on();
    } else {
        pump.off();
    }

    camera.captureImage();

    delay(5000);
}
