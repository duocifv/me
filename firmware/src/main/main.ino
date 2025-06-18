// Chương trình điều khiển hệ thống thủy canh ổn định trên ESP32-CAM (AI-Thinker)
// Phải build với support PSRAM và chọn board "AI Thinker ESP32-CAM"
// - Kết nối WiFi, lấy cấu hình từ server
// - Khởi tạo và điều khiển relay (LED, quạt, bơm) qua expander
// - Đọc sensor DHT22 và DS18B20, gửi dữ liệu mỗi 5s
// - Chụp ảnh OV2640 camera, gửi lên server
// - Gộp báo lỗi, gửi theo lô

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

// =====================================
// CẤU HÌNH TOÀN CỤC
// =====================================
WifiModule wifi(ssid1, password);                                           // Module WiFi chính
HttpConfigModule httpConfig(host, port, configPath, deviceToken, deviceId); // Lấy config từ server
HttpErrorModule httpError(host, port, errorPath, deviceToken, deviceId);    // Gửi báo lỗi
HttpSensorsModule *httpSensor = nullptr;                                    // Gửi dữ liệu sensor
HttpCameraModule *httpCamera = nullptr;                                     // Gửi ảnh camera

ExpanderRelay fanRelay(0), ledRelay(1), pumpRelay(2); // Relay quạt, LED, bơm trên expander
DHTModule dht;                                        // Sensor nhiệt độ, độ ẩm DHT22
DS18B20Module ds18b20;                                // Sensor nhiệt độ DS18B20\ nCameraModule   cameraModule; // Module camera OV2640

// Buffer JSON tăng lên để tránh tràn khi nhiều trường
char jsonBuffer[1024];

// Biến lưu giá trị đo
float ambientTemp = NAN, humidity = NAN, waterTemp = NAN;

// Trạng thái relay (true = ON, false = OFF)
bool ledOn = true;
bool fanOn = true;
bool pumpOn = true;

// Thời điểm lần cuối relay đổi trạng thái
timer_t ledTs, fanTs, pumpTs;

// Thời gian bật/tắt relay (ms)
const unsigned long LED_ON_MS = 15UL * 1000;
const unsigned long LED_OFF_MS = 2UL * 60UL * 1000;
const unsigned long FAN_ON_MS = 3UL * 60UL * 1000;
const unsigned long FAN_OFF_MS = 2UL * 60UL * 1000;
const unsigned long PUMP_ON_MS = 30UL * 1000;
const unsigned long PUMP_OFF_MS = 2UL * 60UL * 1000;

// Thời gian giữa các lần đọc và gửi sensor (ms)
const unsigned long SENSOR_INTERVAL = 5UL * 1000;
unsigned long lastSensorTs = 0;

// =====================================
// HÀM BÁO LỖI
// =====================================
void reportError(const char *module, const char *msg)
{
  // Gom module:message, tách bằng dấu phẩy
  if (errorBuffer.length() + strlen(module) + strlen(msg) + 2 < sizeof(jsonBuffer))
  {
    errorBuffer += String(module) + ":" + msg + ",";
  }
}

// =====================================
// LẤY CẤU HÌNH QUA WiFi TẠM THỜI
// =====================================
void fetchConfigOverTempWiFi()
{
  const char *trySsids[] = {ssid1, ssid2};
  for (int i = 0; i < 2; ++i)
  {
    WiFi.begin(trySsids[i], password);
    unsigned long start = millis();
    while (millis() - start < 10000 && WiFi.status() != WL_CONNECTED)
    {
      delay(200);
    }
    if (WiFi.status() == WL_CONNECTED)
    {
      if (httpConfig.fetchConfig())
      {
        // Đã lấy được config
        break;
      }
      else
      {
        reportError("Config", ("fetch fail " + String(trySsids[i])).c_str());
      }
    }
    else
    {
      reportError("WiFi-Temp", ("fail " + String(trySsids[i])).c_str());
    }
    WiFi.disconnect(true);
    delay(500);
  }
}

// =====================================
// KHỞI TẠO RELAY
// =====================================
bool initRelays()
{
  bool okF = fanRelay.begin();
  bool okL = ledRelay.begin();
  bool okP = pumpRelay.begin();
  if (!okF)
    reportError("fanRelay", "init fail");
  if (!okL)
    reportError("ledRelay", "init fail");
  if (!okP)
    reportError("pumpRelay", "init fail");
  // Bắt buộc cả 3 relay phải OK mới tiếp tục
  if (!(okF && okL && okP))
    return false;
  // Set trạng thái ban đầu là ON
  ledRelay.on();
  fanRelay.on();
  pumpRelay.on();
  return true;
}

// =====================================
// KHỞI TẠO SENSOR & CAMERA ESP32-CAM
// =====================================
void initSensors()
{
  dht.begin();
  ds18b20.begin();
  const char *p = httpConfig.sensorEndpoint.length() ? httpConfig.sensorEndpoint.c_str() : sensorPath;
  const char *h = httpConfig.configuredHost.length() ? httpConfig.configuredHost.c_str() : host;
  uint16_t r = httpConfig.configuredPort ? httpConfig.configuredPort : port;
  static HttpSensorsModule m(h, r, p, deviceToken, deviceId);
  httpSensor = &m;
  httpSensor->begin();
}

void initCamera()
{
  // Khởi camera OV2640 trên ESP32-CAM (AI-Thinker)
  // Đảm bảo PSRAM đã bật, flash light = GPIO4, camera pins: XCLK=21,PCLK=22,
  // SIOD=26,SIOC=27, Y9=35,Y8=34,Y7=39,Y6=36,Y5=19,Y4=18,Y3=5,Y2=4,Y1=15,Y0=13, VSYNC=25, HREF=23
  cameraModule.init();
  const char *p = httpConfig.cameraEndpoint.length() ? httpConfig.cameraEndpoint.c_str() : imgPath;
  const char *h = httpConfig.configuredHost.length() ? httpConfig.configuredHost.c_str() : host;
  uint16_t r = httpConfig.configuredPort ? httpConfig.configuredPort : port;
  static HttpCameraModule m(h, r, p, deviceToken, deviceId);
  httpCamera = &m;
  httpCamera->setTimeout(20000);
}

// =====================================
// CHUYỂN ĐỔI TRẠNG THÁI RELAY
// =====================================
void tickRelay()
{
  unsigned long now = millis();
  // LED
  if (ledOn ? (now - ledTs >= LED_ON_MS) : (now - ledTs >= LED_OFF_MS))
  {
    ledOn = !ledOn;
    if (ledOn)
      ledRelay.on();
    else
      ledRelay.off();
    ledTs = now;
  }
  // FAN
  if (fanOn ? (now - fanTs >= FAN_ON_MS) : (now - fanTs >= FAN_OFF_MS))
  {
    fanOn = !fanOn;
    if (fanOn)
      fanRelay.on();
    else
      fanRelay.off();
    fanTs = now;
  }
  // PUMP
  if (pumpOn ? (now - pumpTs >= PUMP_ON_MS) : (now - pumpTs >= PUMP_OFF_MS))
  {
    pumpOn = !pumpOn;
    if (pumpOn)
      pumpRelay.on();
    else
      pumpRelay.off();
    pumpTs = now;
  }
}

// =====================================
// SETUP
// =====================================
void setup()
{
  Serial.begin(115200);
  delay(1000);

  fetchConfigOverTempWiFi();

  if (!initRelays())
  {
    Serial.println("Error: Relay init failed, halting system.");
    while (true)
      delay(1000);
  }
  initSensors();
  initCamera();

  // Cập nhật thông tin WiFi chính
  String uS = httpConfig.wifiSsid.length() ? httpConfig.wifiSsid : ssid1;
  String uP = httpConfig.wifiPassword.length() ? httpConfig.wifiPassword : password;
  wifi.updateCredentials(uS.c_str(), uP.c_str());

  unsigned long now = millis();
  ledTs = fanTs = pumpTs = now;
  lastSensorTs = now - SENSOR_INTERVAL; // gửi dữ liệu ngay lần đầu
}

// =====================================
// LOOP CHÍNH
// =====================================
void loop()
{
  tickRelay();

  // Kiểm tra kết nối WiFi
  if (!wifi.isConnected())
  {
    if (!wifi.connect())
      reportError("WiFi", "reconnect fail");
    delay(50);
    return;
  }

  unsigned long now = millis();
  // Chỉ đọc và gửi sensor mỗi SENSOR_INTERVAL
  if (now - lastSensorTs >= SENSOR_INTERVAL)
  {
    lastSensorTs = now;

    // Đọc DHT22
    dht.update();
    ambientTemp = dht.getTemperature();
    humidity = dht.getHumidity();
    if (!dht.hasData())
      reportError("DHT22", "no data");

    // Đọc DS18B20
    waterTemp = ds18b20.getTemperature();
    if (isnan(waterTemp))
      reportError("DS18B20", "no data");

    // Tạo JSON và gửi
    size_t len = buildJsonSnapshots(jsonBuffer, sizeof(jsonBuffer),
                                    waterTemp, ambientTemp, humidity,
                                    7.0, 1.5, 400);
    if (len == 0)
    {
      reportError("JSON", "build fail");
    }
    else if (httpSensor && !httpSensor->sendData(jsonBuffer, len))
    {
      reportError("HTTP-Sensor", "send fail");
    }

    // Chụp ảnh và gửi
    if (httpCamera)
    {
      camera_fb_t *fb = cameraModule.capture();
      if (fb)
      {
        bool sent = httpCamera->send(fb, len);
        if (!sent)
          reportError("HTTP-Camera", "send fail");
        cameraModule.release(fb); // Luôn giải phóng buffer
      }
      else
      {
        reportError("Camera", "capture fail");
      }
    }

    // Gửi log lỗi theo lô
    if (errorBuffer.length())
    {
      errorBuffer.remove(errorBuffer.length() - 1);
      if (httpError.sendError("Batch-Errors", errorBuffer.c_str()))
      {
        errorBuffer = "";
      }
    }
  }

  delay(10);
}
