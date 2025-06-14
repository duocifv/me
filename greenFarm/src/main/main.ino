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

#define DEFAULT_DEEP_SLEEP_INTERVAL_US (5ULL * 60ULL * 1000000ULL)  // 5 phút
#define DEFAULT_PUMP_ON_TIME_MS (PUMP_ON_MS)
#define LED_ON_TIME_MS (30UL * 60UL * 1000UL)  // 30 phút

WifiModule wifi(ssid, password);
HttpConfigModule httpConfig(host, port, configPath, deviceToken, deviceId);
HttpErrorModule httpError(host, port, errorPath, deviceToken, deviceId);
HttpSensorsModule *httpSensor = nullptr;
HttpCameraModule *httpCamera = nullptr;

DHTModule dht;
DS18B20Module ds18b20;
RelayIOExpanderModule pumpRelay(0);
RelayIOExpanderModule ledRelay(1);
RelayIOExpanderModule fanLargeRelay(2);

CameraModule cameraModule;
char jsonBuffer[512];

// Trạng thái giữ qua Deep Sleep
RTC_DATA_ATTR bool pumpHasRun = false;
RTC_DATA_ATTR bool ledHasRun = false;
RTC_DATA_ATTR bool fanHasRun = false;
RTC_DATA_ATTR uint64_t ledStartTime = 0;

// Biến trạng thái lỗi
bool wifiErr = false, dsErr = false, dhtErr = false;
float waterTemp = NAN, ambientTemp = NAN, humidity = NAN;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n===== Wake từ Deep Sleep: setup() =====");

  pumpRelay.begin();
  ledRelay.begin();
  fanLargeRelay.begin();

  // Kết nối WiFi tạm để lấy cấu hình
  Serial.print("[Setup] Kết nối WiFi tạm thời: ");
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
      Serial.println("⚠️ [Setup] Lỗi fetch config, dùng mặc định");
      httpError.sendError("Config", "Fetch cấu hình thất bại");
    }
  } else {
    Serial.println(" FAIL");
    httpError.sendError("WiFi-Temp", "Kết nối WiFi tạm thời thất bại");
  }
  WiFi.disconnect(true);

  // Kết nối WiFi chính thức
  String useSsid = httpConfig.wifiSsid.length() > 0 ? httpConfig.wifiSsid : ssid;
  String usePass = httpConfig.wifiPassword.length() > 0 ? httpConfig.wifiPassword : password;

  Serial.printf("[Setup] Kết nối WiFi chính thức: SSID='%s'... ", useSsid.c_str());
  wifi.updateCredentials(useSsid.c_str(), usePass.c_str());  // Sửa lỗi gán lại đối tượng
  wifi.connect();

  if (!wifi.isConnected()) {
    Serial.println(" FAIL");
    wifiErr = true;
    httpError.sendError("WiFi", "Kết nối WiFi chính thức thất bại");
  } else {
    Serial.println(" OK");
    Serial.printf("WiFi IP: %s\n", WiFi.localIP().toString().c_str());
    wifiErr = false;
  }

  // Khởi tạo sensor
  dht.begin();
  ds18b20.begin();

  const char *sensorPathUrl = httpConfig.sensorEndpoint.length() > 0 ? httpConfig.sensorEndpoint.c_str() : sensorPath;
  const char *cameraPathUrl = httpConfig.cameraEndpoint.length() > 0 ? httpConfig.cameraEndpoint.c_str() : imgPath;
  const char *hostUsed = httpConfig.configuredHost.length() > 0 ? httpConfig.configuredHost.c_str() : host;
  uint16_t portUsed = httpConfig.configuredPort > 0 ? httpConfig.configuredPort : port;

  static HttpSensorsModule sensorModule(hostUsed, portUsed, sensorPathUrl, deviceToken, deviceId);
  httpSensor = &sensorModule;
  httpSensor->begin();

  static HttpCameraModule cameraMod(hostUsed, portUsed, cameraPathUrl, deviceToken, deviceId);
  httpCamera = &cameraMod;
  httpCamera->setTimeout(40000);

  // Đọc DHT22
  dht.update();
  if (!dht.hasData()) {
    dhtErr = true;
    httpError.sendError("Sensor-DHT22", "Không lấy được dữ liệu DHT22");
  } else {
    dhtErr = false;
    ambientTemp = dht.getTemperature();
    humidity = dht.getHumidity();
  }

  // Đọc DS18B20
  waterTemp = ds18b20.getTemperature();
  if (isnan(waterTemp)) {
    dsErr = true;
    httpError.sendError("Sensor-DS18B20", "Không lấy được dữ liệu DS18B20");
  } else {
    dsErr = false;
  }

  // Gửi dữ liệu nếu không lỗi
 if (!wifiErr) {
  float tempSend = isnan(waterTemp) ? 0.0 : waterTemp;
  float ambSend = isnan(ambientTemp) ? 0.0 : ambientTemp;
  float humSend  = isnan(humidity) ? 0.0 : humidity;

  size_t len = buildJsonSnapshots(jsonBuffer, sizeof(jsonBuffer), tempSend, ambSend, humSend, 7.0, 1.5, 400);
  if (len > 0) {
    if (!httpSensor->sendData(jsonBuffer, len)) {
      httpError.sendError("HTTP-Sensor", "Gửi dữ liệu sensor thất bại");
    }
  } else {
    httpError.sendError("JSON", "Tạo JSON sensor thất bại");
  }
} else {
  httpError.sendError("WiFi", "Bỏ qua gửi dữ liệu do WiFi chính thất bại");
}

  // Gửi ảnh nếu có camera
  if (!wifiErr && httpCamera) {
    if (cameraModule.init()) {
      camera_fb_t *fb = cameraModule.capture();
      if (fb) {
        unsigned long duration;
        if (!httpCamera->send(fb, duration)) {
          httpError.sendError("HTTP-Camera", "Gửi ảnh thất bại");
        }
        cameraModule.release(fb);
      } else {
        httpError.sendError("Camera", "Không chụp được ảnh");
      }
    } else {
      httpError.sendError("Camera", "Khởi tạo camera thất bại");
    }
  }

  // Bật bơm lần đầu
  if (!pumpHasRun) {
    Serial.println("[Pump] Bật bơm lần đầu...");
    pumpRelay.on();
    delay(DEFAULT_PUMP_ON_TIME_MS);
    pumpRelay.off();
    pumpHasRun = true;
  }
  delay(2000);
  // Bật LED lần đầu
  if (!ledHasRun) {
    Serial.println("[LED] Bật đèn LED lần đầu...");
    ledRelay.on();
    ledStartTime = millis();  // Ghi nhận thời gian bật
    ledHasRun = true;
  }
  delay(2000);
  // Bật quạt lần đầu
  if (!fanHasRun) {
    Serial.println("[Fan] Bật quạt lần đầu...");
    fanLargeRelay.on();
    fanHasRun = true;
  }

  // Đi vào deep sleep
  Serial.println("[Sleep] Đi vào Deep Sleep sau 5 giây...");
  delay(5000);
  esp_sleep_enable_timer_wakeup(DEFAULT_DEEP_SLEEP_INTERVAL_US);
  esp_deep_sleep_start();
}

void loop() {
  // Không dùng
}
