 Nếu dùng PlatformIO (trong VSCode)

 --------------------------

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include "esp_camera.h"
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// === Cấu hình Wi-Fi & Server ===
static const char* SSID           = "Mai Lan";
static const char* PASS           = "1234567899";
static const char* HOST           = "my.duocnv.top";
static const int   HTTPS_PORT     = 443;
static const char* SNAPSHOT_ID    = "3";
static const char* TOKEN          = "esp32";
static const char* DEVICE_ID      = "device-001";
static const char* API_PATH       = "/v1/crop-instances/3/snapshots";

// === Cấu hình cảm biến ===
#define LIGHT_SENSOR_PIN_1 4    // GPIO4
#define LIGHT_SENSOR_PIN_2 14   // GPIO14
#define DHT_PIN            16   // GPIO16
#define DHT_TYPE           DHT22
#define DS18B20_PIN        13   // GPIO13

DHT dht(DHT_PIN, DHT_TYPE);
OneWire oneWire(DS18B20_PIN);
DallasTemperature ds18b20(&oneWire);

// === Thời gian giữa các lần chụp (ms) ===
static const unsigned long CAPTURE_INTERVAL_MS = 3000;

// Boundary cố định
static const char* MULTI_BOUNDARY = "ESP32Boundary";

// Kích thước buffer header HTTP
static const size_t HEADER_BUF_SIZE = 1024;

// Hàm đọc dữ liệu cảm biến
String getSensorDataJson() {
  // Cảm biến ánh sáng (giả sử analog)
  int light1 = analogRead(LIGHT_SENSOR_PIN_1);
  int light2 = analogRead(LIGHT_SENSOR_PIN_2);

  // Cảm biến DHT22
  float tempDHT = dht.readTemperature();
  float humidDHT = dht.readHumidity();

  // Cảm biến DS18B20
  ds18b20.requestTemperatures();
  float tempDS18B20 = ds18b20.getTempCByIndex(0);

  // Gói dữ liệu JSON
  String json = "{";
  json += "\"lightSensor1\": " + String(light1) + ",";
  json += "\"lightSensor2\": " + String(light2) + ",";
  json += "\"dhtTemperature\": " + String(tempDHT) + ",";
  json += "\"dhtHumidity\": " + String(humidDHT) + ",";
  json += "\"ds18b20Temperature\": " + String(tempDS18B20);
  json += "}";
  return json;
}

// Khởi tạo camera ESP32-CAM
static bool initCamera() {
  camera_config_t cfg;
  cfg.ledc_channel    = LEDC_CHANNEL_0;
  cfg.ledc_timer      = LEDC_TIMER_0;
  cfg.pin_d0          = 5;  cfg.pin_d1  = 18;
  cfg.pin_d2          = 19; cfg.pin_d3  = 21;
  cfg.pin_d4          = 36; cfg.pin_d5  = 39;
  cfg.pin_d6          = 34; cfg.pin_d7  = 35;
  cfg.pin_xclk        = 0;  cfg.pin_pclk = 22;
  cfg.pin_vsync       = 25; cfg.pin_href = 23;
  cfg.pin_sscb_sda    = 26; cfg.pin_sscb_scl = 27;
  cfg.pin_pwdn        = 32; cfg.pin_reset = -1;
  cfg.xclk_freq_hz    = 20000000;
  cfg.pixel_format    = PIXFORMAT_JPEG;
  cfg.frame_size      = FRAMESIZE_VGA;  // VGA 640×480
  cfg.jpeg_quality    = 12;
  cfg.fb_count        = 1;

  if (esp_camera_init(&cfg) != ESP_OK) {
    Serial.println("Camera init failed");
    return false;
  }
  return true;
}

// Kết nối Wi-Fi
static void connectWiFi() {
  WiFi.begin(SSID, PASS);
  Serial.print("WiFi connecting");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println(" connected");
}

// Gửi ảnh chụp qua HTTPS multipart/form-data + JSON cảm biến
static void sendFrame(camera_fb_t* fb, String sensorJson) {
  const char* fileHeader =
    "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"esp32.jpg\"\r\n"
    "Content-Type: image/jpeg\r\n\r\n";

  const String jsonPart =
    "\r\n--" + String(MULTI_BOUNDARY) + "\r\n"
    "Content-Disposition: form-data; name=\"sensorData\"\r\n"
    "Content-Type: application/json\r\n\r\n" + sensorJson + "\r\n";

  size_t preambleLen = 2 + strlen(MULTI_BOUNDARY) + strlen(fileHeader);
  size_t closingLen = strlen("\r\n--") + strlen(MULTI_BOUNDARY) + strlen("--\r\n");
  size_t contentLength = preambleLen + fb->len + jsonPart.length() + closingLen;

  char header[HEADER_BUF_SIZE];
  size_t headLen = snprintf(header, HEADER_BUF_SIZE,
    "POST %s HTTP/1.1\r\n"
    "Host: %s\r\n"
    "accept: */*\r\n"
    "x-device-token: %s\r\n"
    "x-device-id: %s\r\n"
    "Content-Type: multipart/form-data; boundary=%s\r\n"
    "Content-Length: %u\r\n\r\n",
    API_PATH, HOST, TOKEN, DEVICE_ID,
    MULTI_BOUNDARY, (unsigned)contentLength
  );

  WiFiClientSecure client;
  client.setInsecure();
  if (!client.connect(HOST, HTTPS_PORT)) {
    Serial.println("HTTPS connect failed");
    return;
  }

  client.write((const uint8_t*)header, headLen);
  client.print("--");
  client.print(MULTI_BOUNDARY);
  client.print(fileHeader);
  client.write(fb->buf, fb->len);
  client.print(jsonPart);
  client.print("--");
  client.print(MULTI_BOUNDARY);
  client.print("--\r\n");

  Serial.println("=== Response ===");
  unsigned long timeout = millis();
  while (client.connected() && (millis() - timeout < 5000)) {
    while (client.available()) {
      Serial.write(client.read());
      timeout = millis();
    }
  }
  Serial.println("\n=== End ===");

  client.stop();
}

void setup() {
  Serial.begin(115200);
  connectWiFi();
  dht.begin();
  ds18b20.begin();
  if (!initCamera()) {
    while (true) { delay(1000); }
  }
}

void loop() {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Capture failed");
    delay(500);
    return;
  }

  String sensorJson = getSensorDataJson();
  Serial.println("Sensor JSON: " + sensorJson);

  sendFrame(fb, sensorJson);
  esp_camera_fb_return(fb);
  delay(CAPTURE_INTERVAL_MS);
}
