#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <esp_camera.h>

#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <base64.h>  // Cần thêm thư viện Base64

// WiFi & Server
static const char* SSID       = "Mai Lan";
static const char* PASS       = "1234567899";
static const char* HOST       = "my.duocnv.top";
static const int   HTTPS_PORT = 443;
static const char* TOKEN      = "esp32";
static const char* DEVICE_ID  = "device-001";
static const char* API_PATH   = "/v1/hydroponics/snapshots";

// Relay
#define RELAY_PIN       12

// Sensors
#define DHTPIN          27
#define DHTTYPE         DHT22
#define ONE_WIRE_BUS    14

DHT dht(DHTPIN, DHTTYPE);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

static const unsigned long LOOP_INTERVAL_MS = 15000;

// === Cấu hình camera (ESP32-CAM AI Thinker) ===
#define PWDN_GPIO_NUM    32
#define RESET_GPIO_NUM   -1
#define XCLK_GPIO_NUM     0
#define SIOD_GPIO_NUM    26
#define SIOC_GPIO_NUM    27

#define Y9_GPIO_NUM      35
#define Y8_GPIO_NUM      34
#define Y7_GPIO_NUM      39
#define Y6_GPIO_NUM      36
#define Y5_GPIO_NUM      21
#define Y4_GPIO_NUM      19
#define Y3_GPIO_NUM      18
#define Y2_GPIO_NUM       5
#define VSYNC_GPIO_NUM   25
#define HREF_GPIO_NUM    23
#define PCLK_GPIO_NUM    22

bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 10;
  config.fb_count = 1;

  return esp_camera_init(&config) == ESP_OK;
}

void connectWiFi() {
  WiFi.begin(SSID, PASS);
  Serial.print("WiFi connecting");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
    if (millis() - start > 15000) {
      Serial.println("\nWiFi connect timeout!");
      return;
    }
  }
  Serial.println(" connected");
  Serial.print("IP: "); Serial.println(WiFi.localIP());
}

void createSensorJsonWithImage(char* buf, size_t bufSize) {
  float ambientTemp = dht.readTemperature();
  float humidity = dht.readHumidity();
  sensors.requestTemperatures();
  float waterTemp = sensors.getTempCByIndex(0);

  if (isnan(ambientTemp)) ambientTemp = 22.0;
  if (isnan(humidity)) humidity = 55.0;
  if (waterTemp == DEVICE_DISCONNECTED_C) waterTemp = 25.4;

  float ph = 6.50;
  float ec = 1.20;
  int orp = 250;

  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    snprintf(buf, bufSize, "{\"error\":\"Camera capture failed\"}");
    return;
  }

  String imageBase64 = base64::encode(fb->buf, fb->len);
  esp_camera_fb_return(fb);

  snprintf(buf, bufSize,
    "{\"sensorData\":{\"water_temperature\":%.2f,\"ambient_temperature\":%.2f,\"humidity\":%.2f},"
    "\"solutionData\":{\"ph\":%.2f,\"ec\":%.2f,\"orp\":%d},"
    "\"image\":\"data:image/jpeg;base64,%s\"}",
    waterTemp, ambientTemp, humidity,
    ph, ec, orp,
    imageBase64.c_str());
}

void sendSnapshot(const char* json) {
  WiFiClientSecure client;
  client.setInsecure();

  if (!client.connect(HOST, HTTPS_PORT)) {
    Serial.println("HTTPS connect failed");
    return;
  }

  char header[512];
  int headerLen = snprintf(header, sizeof(header),
    "POST %s HTTP/1.1\r\n"
    "Host: %s\r\n"
    "accept: */*\r\n"
    "x-device-token: %s\r\n"
    "x-device-id: %s\r\n"
    "Content-Type: application/json\r\n"
    "Content-Length: %d\r\n\r\n",
    API_PATH, HOST, TOKEN, DEVICE_ID, (int)strlen(json));

  if (headerLen <= 0 || headerLen >= (int)sizeof(header)) {
    Serial.println("Header buffer overflow");
    client.stop();
    return;
  }

  client.print(header);
  client.print(json);

  unsigned long timeout = millis();
  while (client.connected() && millis() - timeout < 5000) {
    while (client.available()) {
      Serial.write(client.read());
      timeout = millis();
    }
  }
  Serial.println();
  client.stop();
}

void setup() {
  Serial.begin(115200);
  Serial.println(">>> Setup start");

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  if (!initCamera()) {
    Serial.println("Camera init failed");
    while (true) delay(1000);
  }

  dht.begin();
  sensors.begin();

  connectWiFi();
}

void loop() {
  unsigned long now = millis();

  static unsigned long lastRelayToggle = 0;
  static unsigned long lastSend = 0;
  static bool pumpOn = false;

  if (now - lastRelayToggle >= 5000) {
    pumpOn = !pumpOn;
    digitalWrite(RELAY_PIN, pumpOn ? HIGH : LOW);
    Serial.println(pumpOn ? "Pump ON" : "Pump OFF");
    lastRelayToggle = now;
  }

  if (now - lastSend >= LOOP_INTERVAL_MS) {
    static char payload[6000];  // Cần lớn hơn vì base64 ảnh khá dài
    createSensorJsonWithImage(payload, sizeof(payload));
    Serial.print("Sending payload: ");
    Serial.println(payload);
    sendSnapshot(payload);
    lastSend = now;
  }

  delay(10);
}
