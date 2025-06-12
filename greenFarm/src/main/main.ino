#include <Arduino.h>
#include "driver/rtc_io.h"
#include "esp_sleep.h"

#include "http_config_module.h"
#include "http_error_module.h"
#include "http_sensors_module.h"
#include "http_camera_module.h"
#include <PCF8574.h>
#include "config.h"
#include "wifi_module.h"
#include "dht_module.h"
#include "ds18b20_module.h"
#include "json_builder.h"
#include "relay_module.h"
#include "camera_module.h"
#include "relay_ioexpander_module.h"

// ----- Hằng số cấu hình -----
#define DEFAULT_DEEP_SLEEP_INTERVAL_US (5ULL * 60ULL * 1000000ULL) // 5 phút
#define DEFAULT_PUMP_ON_TIME_MS      (PUMP_ON_MS)
#define LED_ON_TIME_MS               (30UL * 60UL * 1000UL)        // 30 phút

// Khai báo các module
WifiModule wifi(ssid, password);
HttpConfigModule httpConfig(host, port, configPath, deviceToken, deviceId);
HttpErrorModule  httpError(host, port, errorPath, deviceToken, deviceId);
HttpSensorsModule *httpSensor = nullptr;
HttpCameraModule  *httpCamera = nullptr;

DHTModule            dht;
DS18B20Module        ds18b20;
RelayIOExpanderModule pumpRelay(0);
RelayIOExpanderModule ledRelay (1);
RelayIOExpanderModule fanLargeRelay(2);

char jsonBuffer[512];

RTC_DATA_ATTR bool     pumpHasRun   = false;
RTC_DATA_ATTR bool     ledHasRun    = false;
RTC_DATA_ATTR uint64_t ledStartTime = 0;

CameraModule cameraModule;
bool wifiErr = false, dsErr = false, dhtErr = false;
float waterTemp = NAN, ambientTemp = NAN, humidity = NAN;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n===== Wake từ Deep Sleep: setup() =====");

  pumpRelay.begin();
  ledRelay.begin();
  fanLargeRelay.begin();

  if (esp_reset_reason() == ESP_RST_DEEPSLEEP && !ledHasRun) {
    Serial.println("[LED] Wake từ deep sleep, bật LED...");
    ledRelay.on();
    ledStartTime = esp_timer_get_time();
    ledHasRun = true;
  }

  Serial.print("[Setup] Kết nối tạm WiFi: ");
  WiFi.begin(ssid, password);
  uint8_t retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" OK");
    if (!httpConfig.fetchConfig()) {
      Serial.println("⚠️ [Setup] Fetch config thất bại, dùng mặc định");
      httpError.sendError("Config", "Fetch cấu hình thất bại");
    }
  } else {
    Serial.println(" FAIL");
    httpError.sendError("WiFi-Temp", "Kết nối tạm WiFi thất bại");
  }
  WiFi.disconnect(true);
  delay(200);

  String useS = httpConfig.wifiSsid.length() > 0 ? httpConfig.wifiSsid : String(ssid);
  String useP = httpConfig.wifiPassword.length() > 0 ? httpConfig.wifiPassword : String(password);
  Serial.printf("[Setup] Kết nối WiFi chính thức: SSID='%s' ... ", useS.c_str());
  wifi = WifiModule(useS.c_str(), useP.c_str());
  wifi.connect();
  if (!wifi.isConnected()) {
    Serial.println(" FAIL");
    wifiErr = true;
    httpError.sendError("WiFi", "Kết nối WiFi chính thức thất bại");
  } else {
    Serial.println(" OK");
    wifiErr = false;
  }

  dht.begin();
  ds18b20.begin();
  delay(200);

  const char *sp = httpConfig.sensorEndpoint.length() > 0 ? httpConfig.sensorEndpoint.c_str() : sensorPath;
  const char *ip = httpConfig.cameraEndpoint.length() > 0 ? httpConfig.cameraEndpoint.c_str() : imgPath;
  const char *uh = httpConfig.configuredHost.length() > 0   ? httpConfig.configuredHost.c_str()   : host;
  uint16_t up = httpConfig.configuredPort > 0             ? httpConfig.configuredPort             : port;

  static HttpSensorsModule sensorModule(uh, up, sp, deviceToken, deviceId);
  httpSensor = &sensorModule;
  httpSensor->begin();

  static HttpCameraModule cameraMod(uh, up, ip, deviceToken, deviceId);
  httpCamera = &cameraMod;
  httpCamera->setTimeout(20000);

  dht.update();
  if (!dht.hasData()) {
    dhtErr = true;
    httpError.sendError("Sensor-DHT22", "Không lấy được dữ liệu DHT22");
  } else {
    dhtErr = false;
    ambientTemp = dht.getTemperature();
    humidity = dht.getHumidity();
  }

  float tds = ds18b20.getTemperature();
  if (isnan(tds)) {
    dsErr = true;
    httpError.sendError("Sensor-DS18B20", "Không lấy được dữ liệu DS18B20");
  } else {
    dsErr = false;
    waterTemp = tds;
  }

  if (!wifiErr && !dhtErr && !dsErr) {
    size_t len = buildJsonSnapshots(jsonBuffer, sizeof(jsonBuffer), waterTemp, ambientTemp, humidity, 7.0, 1.5, 400);
    if (len > 0 && httpSensor) {
      bool ok = httpSensor->sendData(jsonBuffer, len);
      if (!ok)
        httpError.sendError("HTTP-Sensor", "Gửi dữ liệu sensor thất bại");
    } else {
      httpError.sendError("JSON", "Payload JSON sensor rỗng hoặc httpSensor null");
    }
  } else {
    if (wifiErr)
      httpError.sendError("HTTP-Sensor", "Bỏ qua gửi do WiFi lỗi");
  }

  if (!wifiErr && httpCamera) {
    cameraModule.init();
    camera_fb_t *fb = cameraModule.capture();
    if (fb) {
      unsigned long duration;
      bool ok = httpCamera->send(fb, duration);
      cameraModule.release(fb);
      if (!ok)
        httpError.sendError("HTTP-Camera", "Gửi ảnh thất bại");
    } else {
      httpError.sendError("Camera-Capture", "Không chụp được frame camera");
    }
  } else {
    if (wifiErr)
      httpError.sendError("HTTP-Camera", "Bỏ qua gửi ảnh do WiFi lỗi");
  }

  uint32_t pt = DEFAULT_PUMP_ON_TIME_MS;

  if (!pumpHasRun) {
    pumpRelay.on();
    delay(pt);
    pumpRelay.off();
    pumpHasRun = true;
  }

  static uint32_t lastFanLargeToggle = 0;
  uint32_t nowMs = millis();
  if (httpConfig.fanSchedule.largeContinuous) {
    fanLargeRelay.on();
  } else {
    if ((fanLargeRelay.readState() == LOW &&
         nowMs - lastFanLargeToggle >= httpConfig.fanSchedule.largeOffMs) ||
        (fanLargeRelay.readState() == HIGH &&
         nowMs - lastFanLargeToggle >= httpConfig.fanSchedule.largeOnMs)) {
      fanLargeRelay.toggle();
      lastFanLargeToggle = nowMs;
    }
  }

  if (ledHasRun) {
    uint64_t currentTime = esp_timer_get_time();
    if ((currentTime - ledStartTime) > (uint64_t)LED_ON_TIME_MS * 1000ULL) {
      Serial.println("[LED] Đã đủ thời gian bật, tắt LED");
      ledRelay.off();
      ledHasRun = false;
    }
  }

  Serial.println("[Sleep] Đi vào deep sleep...");
  esp_sleep_enable_timer_wakeup(DEFAULT_DEEP_SLEEP_INTERVAL_US);
  esp_deep_sleep_start();
}

void loop() {
  // Không cần dùng loop trong ứng dụng deep sleep
}
