
// File: main.ino
#include <Arduino.h>
#include "driver/rtc_io.h"
#include "esp_sleep.h"

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



#define DEFAULT_DEEP_SLEEP_INTERVAL_US (5ULL * 60ULL * 1000000ULL)  // 5 phút
#define DEFAULT_PUMP_ON_TIME_MS (PUMP_ON_MS)
#define LED_ON_TIME_MS (30UL * 60UL * 1000UL)  // 30 phút

WifiModule wifi(ssid, password);
HttpConfigModule httpConfig(host, port, configPath, deviceToken, deviceId);
HttpErrorModule httpError(host, port, errorPath, deviceToken, deviceId);
HttpSensorsModule *httpSensor = nullptr;
HttpCameraModule *httpCamera = nullptr;

ExpanderRelay fanRelay(0);
DS18B20Module ds18b20;
DHTModule dht;


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
  wifi.updateCredentials(useSsid.c_str(), usePass.c_str());
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

  // Khởi ExpanderRelay, nhưng không dừng chương trình nếu lỗi
  // bool pumpOk = pumpRelay.begin();
  // bool ledOk = ledRelay.begin();
  bool fanOk = fanRelay.begin();


  if (fanOk) {
    Serial.println("✅ PCF8574 kết nối thành công.");
    fanRelay.off();
    } else {
    Serial.println("⚠️ Có lỗi kết nối ExpanderRelay:");
    // if (!pumpOk) Serial.println("   • pumpRelay");
    // if (!ledOk) Serial.println("   • ledRelay");
    if (!fanOk) Serial.println("   • fanRelay");

    // Gửi một lần API lỗi duy nhất, gom các relay lỗi lại
    String errList;
    // if (!pumpOk) errList += "pumpRelay,";
    // if (!ledOk) errList += "ledRelay,";
    if (!fanOk) errList += "fanRelay,";
    // Bỏ dấu phẩy cuối
    errList.remove(errList.length() - 1);
    httpError.sendError("Relay-Init", errList.c_str());
    while (true); 
  }

  // Khởi sensor & modules HTTP
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

  // Đọc cảm biến
  dht.update();
  if (!dht.hasData()) {
    dhtErr = true;
    httpError.sendError("Sensor-DHT22", "Không lấy được dữ liệu DHT22");
  } else {
    dhtErr = false;
    ambientTemp = dht.getTemperature();
    humidity = dht.getHumidity();
  }

  waterTemp = ds18b20.getTemperature();
  if (isnan(waterTemp)) {
    dsErr = true;
    httpError.sendError("Sensor-DS18B20", "Không lấy được dữ liệu DS18B20");
  } else dsErr = false;

  // Gửi dữ liệu sensor
  if (!wifiErr) {
    size_t len = buildJsonSnapshots(jsonBuffer, sizeof(jsonBuffer),
                                    isnan(waterTemp) ? 0 : waterTemp,
                                    isnan(ambientTemp) ? 0 : ambientTemp,
                                    isnan(humidity) ? 0 : humidity,
                                    7.0, 1.5, 400);
    if (len > 0) {
      if (!httpSensor->sendData(jsonBuffer, len))
        httpError.sendError("HTTP-Sensor", "Gửi dữ liệu sensor thất bại");
    } else httpError.sendError("JSON", "Tạo JSON sensor thất bại");
  } else httpError.sendError("WiFi", "Bỏ qua gửi dữ liệu do WiFi thất bại");

  // Gửi ảnh camera
  if (!wifiErr && httpCamera) {
    if (cameraModule.init()) {
      camera_fb_t *fb = cameraModule.capture();
      if (fb) {
        unsigned long duration;
        if (!httpCamera->send(fb, duration))
          httpError.sendError("HTTP-Camera", "Gửi ảnh thất bại");
        cameraModule.release(fb);
      } else httpError.sendError("Camera", "Không chụp được ảnh");
    } else httpError.sendError("Camera", "Khởi tạo camera thất bại");
  }

  // Quản lý relay lần đầu
  // if (!pumpHasRun && pumpOk) {
  //   pumpRelay.on();
  //   delay(DEFAULT_PUMP_ON_TIME_MS);
  //   pumpRelay.off();
  //   pumpHasRun = true;
  // }
  // delay(2000);
  // if (!ledHasRun && ledOk) {
  //   ledRelay.on();
  //   ledStartTime = millis();
  //   ledHasRun = true;
  // }
  // delay(2000);
  if (!fanHasRun && fanOk) {
    fanRelay.on();
    fanHasRun = true;
  }

  // Deep Sleep
  Serial.println("[Sleep] Đi vào Deep Sleep sau 5 giây...");
  delay(5000);
  esp_sleep_enable_timer_wakeup(DEFAULT_DEEP_SLEEP_INTERVAL_US);
  esp_deep_sleep_start();
}

void loop() {}
