#include <Arduino.h>
#include <ArduinoJson.h>
#include "http_config_module.h"
#include "http_error_module.h"
#include "http_sensors_module.h"
#include "http_camera_module.h"
#include "expander_relay.h"
#include "config.h"
#include "wifi_module.h"
// #include "dht_module.h"
#include "ds18b20_module.h"
#include "json_builder.h"
#include "camera_module.h"
#include "led_indicator.h"
#include <time.h>
#include "schedule.h" // 👈 Thêm dòng này để dùng lịch đã định nghĩa

// =====================================
// CẤU HÌNH TOÀN CỤC
// =====================================
WifiModule wifi(ssid1, password);
HttpConfigModule httpConfig(host, port, configPath, deviceToken, deviceId);
HttpErrorModule httpError(host, port, errorPath, deviceToken, deviceId);
HttpSensorsModule *httpSensor = nullptr;
HttpCameraModule *httpCamera = nullptr;

// Khởi tạo 3 relay gắn vào chân P0, P1, P2 của PCF8574 dùng chung
ExpanderRelay fanRelay(0);
ExpanderRelay ledRelay(1);
ExpanderRelay pumpRelay(2);
// DHTModule dht;
// Khởi tạo module DS18B20
DS18B20Module tempSensor;
CameraModule cameraModule;
LedIndicator led;

char jsonBuffer[1024];
String errorBuffer;

float ambientTemp = NAN, humidity = NAN, waterTemp = NAN;

unsigned long wifiPrev = 0, relayPrev = 0, sensorPrev = 0, cameraPrev = 0, errorPrev = 0, fanPrev = 0, ledPrev = 0, pumpPrev = 0;

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

bool initRelays()
{

  if (ExpanderRelay::beginBus())
  {
    reportError("PCF8574", "✅ PCF8574 kết nối thành công.");
    fanRelay.off();
    ledRelay.off();
    pumpRelay.off();
  }
  else
  {
    reportError("PCF8574", "❌ Lỗi kết nối PCF8574.");
    led.blink(3, 200);
    return false;
  }
  return true;
}

bool initSensors()
{
  // dht.begin();
  // Khởi động DS18B20

  tempSensor.begin();
  if (!tempSensor.isFound())
  {
    reportError("DS18B20", "❌ Không tìm thấy cảm biến DS18B20!");
    led.blink(3, 200);
    return false;
  }
  else
  {
    reportError("DS18B20", "✅ Cảm biến DS18B20 đã sẵn sàng");
    led.blink(1, 200);
  }

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
    reportError("Camera init", "init fail");
    return false;
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

void setup()
{

  Serial.begin(115200);
  delay(2000);
  Serial.println("Setup start, brownout disabled");

  wifi.connect();

  bool relayOk = initRelays();

  bool sensorsOk = initSensors();

  bool cameraOk = initCamera();

  delay(500);

  configTime(7 * 3600, 0, "pool.ntp.org", "time.nist.gov");

  unsigned long now = millis();
  wifiPrev = fanPrev = ledPrev = pumpPrev = sensorPrev = cameraPrev = errorPrev = now;

  // if (!relayOk || !sensorsOk || !cameraOk)
  // {
  //   delay(1000);
  //   ESP.restart();
  // }

  Serial.println("Setup complete, entering loop");
}

void loop()
{
  unsigned long now = millis();

  if (throttle(wifiPrev, 5000))
 {
  if (wifi.isConnected())
  {
    if (!httpConfig.fetchConfig())
    {
      reportError("Config", "Config fail");
    }
  }
  else
  {
    if (!wifi.connect())
    {
      reportError("WiFi", "WiFi fail");
    }
  }
}

  auto on = httpConfig.devices;
  fanRelay.set(on.fan);
  ledRelay.set(on.led);
  pumpRelay.set(on.pump);

  if (throttle(sensorPrev, httpConfig.intervals.dataInterval))
  {
    // dht.update();
    // ambientTemp = dht.getTemperature();
    // humidity = dht.getHumidity();
    // if (!dht.hasData())
    //   reportError("DHT22", "no data");
    float t = tempSensor.getTemperature();
    if (isnan(t))
    {
      reportError("DS18B20", "no data");
      waterTemp = 0;
    }
    else
    {
      waterTemp = t;
    }

    ambientTemp = 0;
    humidity = 0;
    delay(200);
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

  if (throttle(cameraPrev, httpConfig.intervals.imageInterval))
  {
    if (httpCamera)
    {
      camera_fb_t *fb = cameraModule.capture();
      if (fb)
      {
        unsigned long durationMs;
        bool sent = httpCamera->send(fb, durationMs);
        if (!sent)
          reportError("HTTP-Camera", "send fail");
        cameraModule.release(fb); // Luôn giải phóng buffer
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
