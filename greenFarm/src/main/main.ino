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

// ----- Các hằng số Deep Sleep & Pump mặc định (từ config.h) -----
// Nếu server không trả deep sleep hay pump time, dùng những giá trị này
#define DEFAULT_DEEP_SLEEP_INTERVAL_US  (5ULL * 60ULL * 1000000ULL) // 5 phút
#define DEFAULT_PUMP_ON_TIME_MS         (PUMP_ON_MS)               // 5000 ms từ config.h

// ----- Khởi tạo WifiModule (bạn có thể bỏ, nếu muốn dùng WiFi.begin() trực tiếp) -----
WifiModule wifi(ssid, password);

// ----- Khởi tạo module lấy config (động) -----
// host, port, deviceToken, deviceId ban đầu lấy từ config.h
HttpConfigModule httpConfig(host, port, configPath, deviceToken, deviceId);

// ----- Khởi tạo module gửi lỗi (qua API) -----
// Sử dụng errorPath từ config.h làm endpoint báo lỗi
HttpErrorModule httpError(host, port, errorPath, deviceToken, deviceId);

// ----- Các module sensor, relay, camera, HTTP (cài tạm NULL) -----
DHTModule       dht;
DS18B20Module   ds18b20;
RelayModule     pumpRelay(12, false);
CameraModule    cameraModule;

// Con trỏ để khởi tạo HttpSensorModule và HttpCameraModule sau khi có giá trị động
HttpSensorModule* httpSensor = nullptr;
HttpCameraModule*  httpCamera = nullptr;

// Buffer JSON
char jsonBuffer[512];

// ----- Biến RTC để giữ trạng thái pump -----
// Nếu chỉ muốn chạy bơm 1 lần trong suốt nhiều lần wake, có thể dùng biến này
RTC_DATA_ATTR bool pumpHasRun = false;

// Trạng thái lỗi
bool wifiErr     = false;
bool ds18b20Err  = false, dhtErr = false;

// Giá trị sensor để log
float waterTemp = NAN, ambientTemp = NAN, humidity = NAN;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n===== Wake từ Deep Sleep: setup() =====");

  // -------------------------------------
  // Bước 0: Kết nối tạm WiFi (ssid, password từ config.h) để fetch config
  // -------------------------------------
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
    // Fetch config từ server
    if (!httpConfig.fetchConfig()) {
      Serial.println("⚠️ [Setup] Fetch config thất bại, dùng mặc định");
      httpError.sendError("Config", "Fetch cấu hình thất bại");
    }
  } else {
    Serial.println(" FAIL");
    Serial.println("⚠️ [Setup] Không kết nối tạm WiFi được, dùng mặc định");
    httpError.sendError("WiFi-Temp", "Kết nối tạm WiFi thất bại");
  }

  // Ngắt kết nối tạm
  WiFi.disconnect(true);
  delay(200);

  // -------------------------------------
  // Bước 1: Kết nối “chính thức” với WiFi dựa vào config động (nếu có)
  // -------------------------------------
  String useSsid     = httpConfig.wifi_ssid.length() > 0
                        ? httpConfig.wifi_ssid
                        : String(ssid);
  String usePassword = httpConfig.wifi_password.length() > 0
                        ? httpConfig.wifi_password
                        : String(password);

  Serial.printf("[Setup] Kết nối WiFi chính thức: SSID='%s' ... ", useSsid.c_str());
  wifi = WifiModule(useSsid.c_str(), usePassword.c_str());
  wifi.connect();
  if (!wifi.isConnected()) {
    Serial.println(" FAIL");
    wifiErr = true;
    Serial.println("⚠️ [Setup] WiFi chính thức không kết nối được");
    httpError.sendError("WiFi", "Kết nối WiFi chính thức thất bại");
  } else {
    Serial.println(" OK");
    wifiErr = false;
  }

  // -------------------------------------
  // Bước 2: Khởi động cảm biến
  // -------------------------------------
  dht.begin();
  ds18b20.begin();
  delay(200);
  Serial.println("[Setup] DHT & DS18B20 begin() xong");

  // -------------------------------------
  // Bước 3: Cài đặt HttpSensorModule và HttpCameraModule
  //   - Nếu server trả endpoint mới, dùng endpoint đó, ngược lại dùng sensorPath/imgPath từ config.h
  //   - Nếu server trả deviceToken/deviceId mới, dùng giá trị ấy, nếu không dùng deviceToken/deviceId từ config.h
  // -------------------------------------
  const char* useSensorPath = httpConfig.sensorPath.length() > 0
                             ? httpConfig.sensorPath.c_str()
                             : sensorPath;
  const char* useImgPath    = httpConfig.imgPath.length() > 0
                             ? httpConfig.imgPath.c_str()
                             : imgPath;

  // Nếu host/port dynamic (server trả) khác, override
  const char* useHost = httpConfig.configured_host.length() > 0
                        ? httpConfig.configured_host.c_str()
                        : host;
  uint16_t usePort   = httpConfig.configured_port > 0
                        ? httpConfig.configured_port
                        : port;

  // Nếu đã có instance cũ, xóa đi rồi new lại
  if (httpSensor) {
    delete httpSensor;
    httpSensor = nullptr;
  }
  if (httpCamera) {
    delete httpCamera;
    httpCamera = nullptr;
  }

  httpSensor = new HttpSensorModule(useHost, usePort, useSensorPath, deviceToken, deviceId);
  httpSensor->begin();

  httpCamera = new HttpCameraModule(useHost, usePort, useImgPath, deviceToken, deviceId);
  httpCamera->setTimeout(20000);

  // -------------------------------------
  // Bước 4: Đọc sensor (DHT22 + DS18B20)
  // -------------------------------------
  dht.update();
  if (!dht.hasData()) {
    dhtErr = true;
    Serial.println("⚠️ [readSensors] Lỗi DHT22");
    httpError.sendError("Sensor-DHT22", "Không lấy được dữ liệu DHT22");
  } else {
    dhtErr      = false;
    ambientTemp = dht.getTemperature();
    humidity    = dht.getHumidity();
  }

  float tempDS = ds18b20.getTemperature();
  if (isnan(tempDS)) {
    ds18b20Err = true;
    Serial.println("⚠️ [readSensors] Lỗi DS18B20");
    httpError.sendError("Sensor-DS18B20", "Không lấy được dữ liệu DS18B20");
  } else {
    ds18b20Err = false;
    waterTemp  = tempDS;
  }

  // -------------------------------------
  // Bước 5: Không sử dụng LED báo lỗi (đã bỏ indicateError)
  // -------------------------------------

  // -------------------------------------
  // Bước 6: Gửi dữ liệu sensor lên server (nếu không lỗi)
  // -------------------------------------
  if (!wifiErr && !dhtErr && !ds18b20Err) {
    float ph  = 7.0;
    float ec  = 1.5;
    int   orp = 400;

    size_t jsonLen = buildJsonSnapshots(
      jsonBuffer, sizeof(jsonBuffer),
      waterTemp, ambientTemp, humidity,
      ph, ec, orp
    );
    Serial.printf("[Setup] buildJsonSnapshots() → length = %u\n", (unsigned)jsonLen);

    if (jsonLen > 0 && httpSensor) {
      bool ok = httpSensor->sendData(jsonBuffer, jsonLen);
      Serial.printf("[Setup] httpSensor.sendData() → %s\n", ok ? "true" : "false");
      if (!ok) {
        httpError.sendError("HTTP-Sensor", "Gửi dữ liệu sensor thất bại");
      }
    } else {
      Serial.println("❌ [uploadData] Payload JSON lỗi hoặc httpSensor null");
      httpError.sendError("JSON", "Payload JSON sensor rỗng hoặc httpSensor null");
    }
  } else {
    Serial.println("⚠️ [uploadData] Bỏ qua gửi dữ liệu do có lỗi");
    if (wifiErr) {
      httpError.sendError("HTTP-Sensor", "Bỏ qua gửi do WiFi lỗi");
    }
  }

  // -------------------------------------
  // Bước 7: Chụp ảnh và gửi (nếu WiFi ok)
  // -------------------------------------
  if (!wifiErr && httpCamera) {
    cameraModule.init();
    camera_fb_t* fb = cameraModule.capture();
    if (fb) {
      unsigned long duration;
      bool ok = httpCamera->send(fb, duration);
      Serial.printf("[Setup] httpCamera.send() → %s, time = %lums\n", ok ? "true" : "false", duration);
      if (!ok) {
        httpError.sendError("HTTP-Camera", "Gửi ảnh thất bại");
      }
      cameraModule.release(fb);
    } else {
      Serial.println("❌ [uploadImage] Không chụp được frame");
      httpError.sendError("Camera-Capture", "Không chụp được frame camera");
    }
  } else {
    Serial.println("⚠️ [uploadImage] Bỏ qua gửi ảnh vì WiFi lỗi hoặc httpCamera null");
    if (wifiErr) {
      httpError.sendError("HTTP-Camera", "Bỏ qua gửi ảnh do WiFi lỗi");
    }
  }

  // -------------------------------------
  // Bước 8: Quản lý bơm
  //   Lần đầu wake hoặc bất kỳ wake nào, nếu server trả pump_on_time_ms, dùng nó,
  //   ngược lại fallback PUMP_ON_MS từ config.h
  // -------------------------------------
  uint32_t usePumpTime = httpConfig.pump_on_time_ms > 0
                         ? httpConfig.pump_on_time_ms
                         : DEFAULT_PUMP_ON_TIME_MS;

  if (!pumpHasRun) {
    Serial.printf("[Pump] Chạy bơm trong %u ms ...\n", usePumpTime);
    pumpRelay.on();
    delay(usePumpTime);
    pumpRelay.off();
    pumpHasRun = true;
    Serial.println("[Pump] Đã tắt bơm và set pumpHasRun = true");
  } else {
    Serial.println("[Pump] Đã chạy bơm trước đó, không chạy lại");
  }

  // -------------------------------------
  // Bước 9: Deep sleep
  //   Nếu server trả deep_sleep_interval_us thì dùng, ngược lại fallback DEFAULT
  // -------------------------------------
  uint64_t useSleepTime = httpConfig.deep_sleep_interval_us > 0
                          ? httpConfig.deep_sleep_interval_us
                          : DEFAULT_DEEP_SLEEP_INTERVAL_US;

  Serial.printf("[Sleep] Kích hoạt timer wakeup %llu us, rồi ngủ\n", useSleepTime);

  // Kích hoạt wakeup timer
  esp_sleep_enable_timer_wakeup(useSleepTime);

  // Tắt camera trước khi ngủ (nếu cần)
  cameraModule.deinit();

  // Thực sự vào deep sleep
  esp_deep_sleep_start();
}

void loop() {
  // Không sử dụng loop() vì toàn bộ logic nằm trong setup() và deep sleep
}
