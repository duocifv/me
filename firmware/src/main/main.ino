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
#include "led_indicator.h"

// =====================================
// CẤU HÌNH TOÀN CỤC
// =====================================
WifiModule wifi(ssid1, password);
HttpConfigModule httpConfig(host, port, configPath, deviceToken, deviceId);
HttpErrorModule httpError(host, port, errorPath, deviceToken, deviceId);
HttpSensorsModule *httpSensor = nullptr;
HttpCameraModule *httpCamera = nullptr;

ExpanderRelay fanRelay(0), ledRelay(1), pumpRelay(2);
DHTModule dht;
DS18B20Module ds18b20;
CameraModule cameraModule;
LedIndicator led;

char jsonBuffer[1024];
String errorBuffer;

float ambientTemp = NAN, humidity = NAN, waterTemp = NAN;

bool ledOn = true, fanOn = true, pumpOn = true;
timer_t ledTs, fanTs, pumpTs;

const unsigned long LED_ON_MS = 15000;
const unsigned long LED_OFF_MS = 2 * 60 * 1000;
const unsigned long FAN_ON_MS = 3 * 60 * 1000;
const unsigned long FAN_OFF_MS = 2 * 60 * 1000;
const unsigned long PUMP_ON_MS = 30000;
const unsigned long PUMP_OFF_MS = 2 * 60 * 1000;
unsigned long wifiPrev = 0, relayPrev = 0, sensorPrev = 0, cameraPrev = 0, errorPrev = 0;

void reportError(const char *module, const char *msg)
{
  if (errorBuffer.length() + strlen(module) + strlen(msg) + 2 < sizeof(jsonBuffer))
  {
    errorBuffer += String(module) + ":" + msg + ",";
  }
}

bool throttle(unsigned long &lastTime, unsigned long interval)
{
  unsigned long now = millis();
  if (now - lastTime >= interval)
  {
    lastTime = now;
    return true;
  }
  return false;
}

void check(bool status, const char *moduleName, uint8_t blinkCount = 3, uint16_t blinkInterval = 100)
{
  if (status)
  {
    Serial.printf("%s OK\n", moduleName);
    led.blink(1, 200); // Nháy 1 lần báo OK
  }
  else
  {
    Serial.printf("%s FAIL\n", moduleName);
    led.blink(blinkCount, blinkInterval); // Nháy nhiều lần báo lỗi
  }
}

void fetchConfigOverTempWiFi()
{
  const char *trySsids[] = {ssid1, ssid2};
  for (int i = 0; i < 2; ++i)
  {
    Serial.printf("Trying temp WiFi: %s\n", trySsids[i]);
    WiFi.begin(trySsids[i], password);
    unsigned long start = millis();
    while (millis() - start < 10000 && WiFi.status() != WL_CONNECTED)
      delay(200);

    if (WiFi.status() == WL_CONNECTED)
    {
      Serial.println("Connected to temp WiFi");
      if (httpConfig.fetchConfig())
      {
        Serial.println("Config fetched successfully");
        break;
      }
      else
      {
        reportError("Config", (String("fetch fail ") + trySsids[i]).c_str());
      }
    }
    else
    {
      reportError("WiFi-Temp", (String("fail ") + trySsids[i]).c_str());
    }

    WiFi.disconnect(true);
    delay(500);
  }
}

bool initRelays()
{
  Serial.println("Initializing relays...");
  bool okF = fanRelay.begin();
  bool okL = ledRelay.begin();
  bool okP = pumpRelay.begin();
  if (!okF)
    reportError("fanRelay", "init fail");
  if (!okL)
    reportError("ledRelay", "init fail");
  if (!okP)
    reportError("pumpRelay", "init fail");
  if (!(okF && okL && okP))
    return false;

  ledRelay.on();
  fanRelay.on();
  pumpRelay.on();
  Serial.println("Relays initialized");
  return true;
}

bool initSensors()
{
  Serial.println("Initializing sensors...");
  dht.begin();
  ds18b20.begin();

  const char *p = httpConfig.sensorEndpoint.length() ? httpConfig.sensorEndpoint.c_str() : sensorPath;
  const char *h = httpConfig.configuredHost.length() ? httpConfig.configuredHost.c_str() : host;
  uint16_t r = httpConfig.configuredPort ? httpConfig.configuredPort : port;

  static HttpSensorsModule m(h, r, p, deviceToken, deviceId);
  httpSensor = &m;
  httpSensor->begin();

  Serial.println("Sensors initialized");
  return true;
}

bool initCamera()
{
  Serial.println("Initializing camera...");
  if (!cameraModule.init())
  {
    reportError("Camera", "init fail");
    return;
  }

  const char *p = httpConfig.cameraEndpoint.length() ? httpConfig.cameraEndpoint.c_str() : imgPath;
  const char *h = httpConfig.configuredHost.length() ? httpConfig.configuredHost.c_str() : host;
  uint16_t r = httpConfig.configuredPort ? httpConfig.configuredPort : port;

  static HttpCameraModule m(h, r, p, deviceToken, deviceId);
  httpCamera = &m;
  httpCamera->setTimeout(20000);

  Serial.println("Camera initialized");
  return true;
}

void tickRelay()
{
  unsigned long now = millis();
  if (ledOn ? (now - ledTs >= LED_ON_MS) : (now - ledTs >= LED_OFF_MS))
  {
    ledOn = !ledOn;
    ledOn ? ledRelay.on() : ledRelay.off();
    ledTs = now;
  }
  if (fanOn ? (now - fanTs >= FAN_ON_MS) : (now - fanTs >= FAN_OFF_MS))
  {
    fanOn = !fanOn;
    fanOn ? fanRelay.on() : fanRelay.off();
    fanTs = now;
  }
  if (pumpOn ? (now - pumpTs >= PUMP_ON_MS) : (now - pumpTs >= PUMP_OFF_MS))
  {
    pumpOn = !pumpOn;
    pumpOn ? pumpRelay.on() : pumpRelay.off();
    pumpTs = now;
  }
}

void setup()
{
#ifdef CONFIG_IDF_TARGET_ESP32
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
#endif
  Serial.begin(115200);
  delay(1000);
  Serial.println("Setup start, brownout disabled");

  fetchConfigOverTempWiFi();

  bool relayOk = initRelays();
  check(relayOk, "Relays");

  bool sensorsOk = initSensors();
  check(sensorsOk, "Sensors");

  bool cameraOk = initCamera();
  if (!cameraOk)
    reportError("Camera", "init fail");
  check(cameraOk, "Camera");

  delay(500);

  String uS = httpConfig.wifiSsid.length() ? httpConfig.wifiSsid : ssid1;
  String uP = httpConfig.wifiPassword.length() ? httpConfig.wifiPassword : password;
  wifi.updateCredentials(uS.c_str(), uP.c_str());

  unsigned long now = millis();
  ledTs = fanTs = pumpTs = now;
  wifiPrev = relayPrev = sensorPrev = cameraPrev = errorPrev = now;

  if (!relayOk || !sensorsOk || !cameraOk)
  {
    delay(1000);
    ESP.restart();
  }

  Serial.println("Setup complete, entering loop");
}

void loop()
{
  unsigned long now = millis();

  if (throttle(wifiPrev, 3000))
  {
    if (!wifi.isConnected() && !wifi.connect())
    {
      reportError("WiFi", "reconnect fail");
    }
  }

  if (throttle(relayPrev, 1000))
  {
    tickRelay();
  }

  if (throttle(sensorPrev, 5000))
  {
    dht.update();
    ambientTemp = dht.getTemperature();
    humidity = dht.getHumidity();
    if (!dht.hasData())
      reportError("DHT22", "no data");
    waterTemp = ds18b20.getTemperature();
    if (isnan(waterTemp))
      reportError("DS18B20", "no data");

    size_t len = buildJsonSnapshots(jsonBuffer, sizeof(jsonBuffer), waterTemp, ambientTemp, humidity, 7.0, 1.5, 400);
    if (len == 0)
      reportError("JSON", "build fail");
    else if (wifi.isConnected() && httpSensor && !httpSensor->sendData(jsonBuffer, len))
    {
      reportError("HTTP-Sensor", "send fail");
    }
  }

  if (throttle(cameraPrev, 20000))
  {
    if (wifi.isConnected() && httpCamera)
    {
      camera_fb_t *fb = cameraModule.capture();
      unsigned long dummy = 0;
      if (fb && fb->len > 1000)
      {
        if (!httpCamera->send(fb, dummy))
          reportError("HTTP-Camera", "send fail");
        cameraModule.release(fb);
      }
      else
      {
        reportError("Camera", "capture fail");
      }
    }
  }

  if (errorBuffer.length() && throttle(errorPrev, 30000))
  {
    errorBuffer.remove(errorBuffer.length() - 1);
    if (httpError.sendError("Batch", errorBuffer.c_str()))
      errorBuffer = "";
  }

  delay(50);
}
