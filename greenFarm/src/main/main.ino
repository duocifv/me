#include <Arduino.h>
#include "driver/rtc_io.h"
#include "esp_sleep.h"

#include "http_config_module.h"
#include "http_error_module.h"

#include "config.h"
#include "wifi_module.h"
#include "http_sensors_module.h"
#include "dht_module.h"
#include "ds18b20_module.h"
#include "json_builder.h"
#include "relay_module.h"
#include "camera_module.h"
#include "http_camera_module.h"

// ----- Constants for Deep Sleep & Pump defaults -----
#define DEFAULT_DEEP_SLEEP_INTERVAL_US (5ULL * 60ULL * 1000000ULL)
#define DEFAULT_PUMP_ON_TIME_MS (PUMP_ON_MS)

// Modules
WifiModule wifi(ssid, password);
HttpConfigModule httpConfig(host, port, configPath, deviceToken, deviceId);
HttpErrorModule httpError(host, port, errorPath, deviceToken, deviceId);
HttpSensorsModule *httpSensor = nullptr;
HttpCameraModule *httpCamera = nullptr;

DHTModule dht;
DS18B20Module ds18b20;
RelayModule pumpRelay(12, false);
CameraModule cameraModule;

char jsonBuffer[512];
RTC_DATA_ATTR bool pumpHasRun = false;
bool wifiErr = false, dsErr = false, dhtErr = false;
float waterTemp = NAN, ambientTemp = NAN, humidity = NAN;

void setup()
{
  Serial.begin(115200);
  delay(500);
  Serial.println("\n===== Wake từ Deep Sleep: setup() =====");

  // Step 0: temporary WiFi to fetch config
  Serial.print("[Setup] Kết nối tạm WiFi: ");
  WiFi.begin(ssid, password);
  uint8_t retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20)
  {
    delay(500);
    Serial.print(".");
    retry++;
  }
  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println(" OK");
    if (!httpConfig.fetchConfig())
    {
      Serial.println("⚠️ [Setup] Fetch config thất bại, dùng mặc định");
      httpError.sendError("Config", "Fetch cấu hình thất bại");
    }
  }
  else
  {
    Serial.println(" FAIL");
    Serial.println("⚠️ [Setup] Không kết nối tạm WiFi được, dùng mặc định");
    httpError.sendError("WiFi-Temp", "Kết nối tạm WiFi thất bại");
  }
  WiFi.disconnect(true);
  delay(200);

  // Step 1: connect official WiFi
  String useS = httpConfig.wifi_ssid.length() > 0 ? httpConfig.wifi_ssid : String(ssid);
  String useP = httpConfig.wifi_password.length() > 0 ? httpConfig.wifi_password : String(password);
  Serial.printf("[Setup] Kết nối WiFi chính thức: SSID='%s' ... ", useS.c_str());
  wifi = WifiModule(useS.c_str(), useP.c_str());
  wifi.connect();
  if (!wifi.isConnected())
  {
    Serial.println(" FAIL");
    wifiErr = true;
    Serial.println("⚠️ [Setup] WiFi chính thức không kết nối được");
    httpError.sendError("WiFi", "Kết nối WiFi chính thức thất bại");
  }
  else
  {
    Serial.println(" OK");
    wifiErr = false;
  }

  // Step 2: init sensors
  dht.begin();
  ds18b20.begin();
  delay(200);
  Serial.println("[Setup] DHT & DS18B20 begin() xong");

  // Step 3: setup HTTP modules
  const char *sp = httpConfig.sensorPath.length() > 0 ? httpConfig.sensorPath.c_str() : sensorPath;
  const char *ip = httpConfig.imgPath.length() > 0 ? httpConfig.imgPath.c_str() : imgPath;
  const char *uh = httpConfig.configured_host.length() > 0 ? httpConfig.configured_host.c_str() : host;
  uint16_t up = httpConfig.configured_port > 0 ? httpConfig.configured_port : port;

  if (httpSensor)
  {
    delete httpSensor;
    httpSensor = nullptr;
  }
  httpSensor = new HttpSensorsModule(uh, up, sp, deviceToken, deviceId);
  httpSensor->begin();

  if (httpCamera)
  {
    delete httpCamera;
    httpCamera = nullptr;
  }
  httpCamera = new HttpCameraModule(uh, up, ip, deviceToken, deviceId);
  httpCamera->setTimeout(20000);

  // Step 4: read sensors
  dht.update();
  if (!dht.hasData())
  {
    dhtErr = true;
    Serial.println("⚠️ [readSensors] Lỗi DHT22");
    httpError.sendError("Sensor-DHT22", "Không lấy được dữ liệu DHT22");
  }
  else
  {
    dhtErr = false;
    ambientTemp = dht.getTemperature();
    humidity = dht.getHumidity();
  }
  float tds = ds18b20.getTemperature();
  if (isnan(tds))
  {
    dsErr = true;
    Serial.println("⚠️ [readSensors] Lỗi DS18B20");
    httpError.sendError("Sensor-DS18B20", "Không lấy được dữ liệu DS18B20");
  }
  else
  {
    dsErr = false;
    waterTemp = tds;
  }

  // Step 6: send sensor data
  if (!wifiErr && !dhtErr && !dsErr)
  {
    size_t len = buildJsonSnapshots(jsonBuffer, sizeof(jsonBuffer), waterTemp, ambientTemp, humidity, 7.0, 1.5, 400);
    Serial.printf("[Setup] buildJsonSnapshots → length=%u\n", (unsigned)len);
    if (len > 0 && httpSensor)
    {
      bool ok = httpSensor->sendData(jsonBuffer, len);
      Serial.printf("[Setup] httpSensor.sendData → %s\n", ok ? "OK" : "FAIL");
      if (!ok)
        httpError.sendError("HTTP-Sensor", "Gửi dữ liệu sensor thất bại");
    }
    else
    {
      Serial.println("❌ [uploadData] Payload JSON lỗi hoặc httpSensor null");
      httpError.sendError("JSON", "Payload JSON sensor rỗng hoặc httpSensor null");
    }
  }
  else
  {
    Serial.println("⚠️ [uploadData] Bỏ qua gửi dữ liệu do có lỗi");
    if (wifiErr)
      httpError.sendError("HTTP-Sensor", "Bỏ qua gửi do WiFi lỗi");
  }

  // Step 7: send camera
  if (!wifiErr && httpCamera)
  {
    cameraModule.init();
    camera_fb_t *fb = cameraModule.capture();
    if (fb)
    {
      unsigned long duration;
      bool ok = httpCamera->send(fb, duration);
      Serial.printf("[Setup] httpCamera.send → %s, time=%lums\n", ok ? "OK" : "FAIL", duration);
      cameraModule.release(fb);
      if (!ok)
        httpError.sendError("HTTP-Camera", "Gửi ảnh thất bại");
    }
    else
    {
      Serial.println("❌ [uploadImage] Không chụp được frame");
      httpError.sendError("Camera-Capture", "Không chụp được frame camera");
    }
  }
  else
  {
    Serial.println("⚠️ [uploadImage] Bỏ qua gửi ảnh vì WiFi lỗi hoặc httpCamera null");
    if (wifiErr)
      httpError.sendError("HTTP-Camera", "Bỏ qua gửi ảnh do WiFi lỗi");
  }

  // Step 8: pump control
  uint32_t pt = httpConfig.pump_on_time_ms > 0 ? httpConfig.pump_on_time_ms : DEFAULT_PUMP_ON_TIME_MS;
  if (!pumpHasRun)
  {
    Serial.printf("[Pump] Chạy bơm trong %u ms ...\n", pt);
    pumpRelay.on();
    delay(pt);
    pumpRelay.off();
    pumpHasRun = true;
    Serial.println("[Pump] Đã tắt bơm và set pumpHasRun = true");
  }
  else
  {
    Serial.println("[Pump] Đã chạy bơm trước đó, không chạy lại");
  }

  // Step 9: deep sleep
  uint64_t st = httpConfig.deep_sleep_interval_us > 0 ? httpConfig.deep_sleep_interval_us : DEFAULT_DEEP_SLEEP_INTERVAL_US;
  Serial.printf("[Sleep] Kích hoạt timer wakeup %llu us, rồi ngủ\n", st);
  esp_sleep_enable_timer_wakeup(st);
  cameraModule.deinit();
  esp_deep_sleep_start();
}

void loop()
{
  // empty
}
