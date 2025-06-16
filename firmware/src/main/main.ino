#include <Arduino.h>
#include <ArduinoJson.h>
#include "http_config_module.h"
#include "http_error_module.h"
#include "http_sensors_module.h"
#include "http_camera_module.h"
#include "expander_relay.h"
#include "config.h"
#include "wifi_module.h"
#include "dht_module.h"
#include "ds18b20_module.h"
#include "json_builder.h"
#include "camera_module.h"

// —————————————————————————————————
// GLOBAL MODULES & CONFIG
// —————————————————————————————————
WifiModule        wifi(ssid1, password);
HttpConfigModule  httpConfig(host, port, configPath, deviceToken, deviceId);
HttpErrorModule   httpError(host, port, errorPath, deviceToken, deviceId);
HttpSensorsModule* httpSensor = nullptr;
HttpCameraModule*  httpCamera = nullptr;

ExpanderRelay fanRelay(0), ledRelay(1), pumpRelay(2);
DHTModule      dht;
DS18B20Module  ds18b20;
CameraModule   cameraModule;

String errorBuffer;
float ambientTemp = NAN, humidity = NAN, waterTemp = NAN;
char jsonBuffer[512]; // ✅ Thêm dòng này để tránh lỗi biên dịch

bool ledOn = false, fanOn = false, pumpOn = false;
unsigned long ledTs = 0, fanTs = 0, pumpTs = 0;

const unsigned long LED_ON_MS   = 15UL * 1000;
const unsigned long LED_OFF_MS  = 2UL  * 60UL * 1000;
const unsigned long FAN_ON_MS   = 3UL  * 60UL * 1000;
const unsigned long FAN_OFF_MS  = 2UL  * 60UL * 1000;
const unsigned long PUMP_ON_MS  = 30UL * 1000;
const unsigned long PUMP_OFF_MS = 2UL  * 60UL * 1000;

void reportError(const char* module, const char* msg) {
  errorBuffer += String(module) + ":" + msg + ",";
}

void fetchConfigOverTempWiFi() {
  const char* trySsids[] = { ssid1, ssid2 };
  bool success = false;

  for (int i = 0; i < 2; ++i) {
    WiFi.begin(trySsids[i], password);
    for (int j = 0; j < 10 && WiFi.status() != WL_CONNECTED; ++j) {
      delay(500);
    }

    if (WiFi.status() == WL_CONNECTED) {
      if (httpConfig.fetchConfig()) {
        success = true;
        break;
      } else {
        reportError("Config", ("fetch fail " + String(trySsids[i])).c_str());
      }
    } else {
      reportError("WiFi-Temp", ("fail " + String(trySsids[i])).c_str());
    }

    WiFi.disconnect(true);
    delay(500);
  }
}

bool initRelays() {
  bool okF = fanRelay.begin(), okL = ledRelay.begin(), okP = pumpRelay.begin();
  if (!okF) reportError("fanRelay", "init fail");
  if (!okL) reportError("ledRelay", "init fail");
  if (!okP) reportError("pumpRelay", "init fail");
  if (okF) fanRelay.off();
  if (okL) ledRelay.off();
  if (okP) pumpRelay.off();
  return okF || okL || okP;
}

void initSensors() {
  dht.begin();
  ds18b20.begin();
  const char* p = httpConfig.sensorEndpoint.length()
    ? httpConfig.sensorEndpoint.c_str() : sensorPath;
  const char* h = httpConfig.configuredHost.length()
    ? httpConfig.configuredHost.c_str() : host;
  uint16_t    r = httpConfig.configuredPort ? httpConfig.configuredPort : port;
  static HttpSensorsModule m(h, r, p, deviceToken, deviceId);
  httpSensor = &m; httpSensor->begin();
}

void initCamera() {
  const char* p = httpConfig.cameraEndpoint.length()
    ? httpConfig.cameraEndpoint.c_str() : imgPath;
  const char* h = httpConfig.configuredHost.length()
    ? httpConfig.configuredHost.c_str() : host;
  uint16_t    r = httpConfig.configuredPort ? httpConfig.configuredPort : port;
  static HttpCameraModule m(h, r, p, deviceToken, deviceId);
  httpCamera = &m; httpCamera->setTimeout(20000);
  cameraModule.init();
}

// ✅ Tên mới ngắn gọn hơn cho updateRelayState()
void tickRelay() {
  unsigned long now = millis();

  if (ledOn ? (now - ledTs >= LED_ON_MS) : (now - ledTs >= LED_OFF_MS)) {
    ledOn = !ledOn;
    ledOn ? ledRelay.on() : ledRelay.off();
    ledTs = now;
  }
  if (fanOn ? (now - fanTs >= FAN_ON_MS) : (now - fanTs >= FAN_OFF_MS)) {
    fanOn = !fanOn;
    fanOn ? fanRelay.on() : fanRelay.off();
    fanTs = now;
  }
  if (pumpOn ? (now - pumpTs >= PUMP_ON_MS) : (now - pumpTs >= PUMP_OFF_MS)) {
    pumpOn = !pumpOn;
    pumpOn ? pumpRelay.on() : pumpRelay.off();
    pumpTs = now;
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  fetchConfigOverTempWiFi();

  if (!initRelays()) while (true) delay(1000);
  initSensors();
  initCamera();

  String uS = httpConfig.wifiSsid.length() ? httpConfig.wifiSsid : ssid1;
  String uP = httpConfig.wifiPassword.length() ? httpConfig.wifiPassword : password;
  wifi.updateCredentials(uS.c_str(), uP.c_str());

  ledRelay.off(); fanRelay.off(); pumpRelay.off();
  unsigned long now = millis();
  ledTs = fanTs = pumpTs = now;
}

void loop() {
  tickRelay();  // ✅ gọi hàm mới

  if (!wifi.isConnected()) {
    if (!wifi.connect()) {
      reportError("WiFi", "reconnect fail");
    }
    delay(50);
    return;
  }

  dht.update();
  ambientTemp = dht.getTemperature();
  humidity    = dht.getHumidity();
  if (!dht.hasData()) reportError("DHT22","no data");

  waterTemp = ds18b20.getTemperature();
  if (isnan(waterTemp)) reportError("DS18B20","no data");

  if (httpSensor) {
    size_t len = buildJsonSnapshots(jsonBuffer, sizeof(jsonBuffer),
                                    waterTemp, ambientTemp, humidity,
                                    7.0, 1.5, 400);
    if (len == 0) {
      reportError("JSON","build fail");
    } else if (!httpSensor->sendData(jsonBuffer, len)) {
      reportError("HTTP-Sensor","send fail");
    }
  }

  if (httpCamera) {
    camera_fb_t* fb = cameraModule.capture();
    if (fb) {
      unsigned long dur;
      if (!httpCamera->send(fb, dur)) reportError("HTTP-Camera","send fail");
      cameraModule.release(fb);
    } else {
      reportError("Camera","capture fail");
    }
  }

  if (errorBuffer.length()) {
    errorBuffer.remove(errorBuffer.length() - 1);
    httpError.sendError("Batch-Errors", errorBuffer.c_str());
    errorBuffer = "";
  }

  delay(50);
}
