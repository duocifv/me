#include <WiFi.h>
#include <WiFiClientSecure.h>

// === Cấu hình Wi-Fi & Server ===
static const char* SSID       = "Mai Lan";
static const char* PASS       = "1234567899";
static const char* HOST       = "my.duocnv.top";
static const int   HTTPS_PORT = 443;
static const char* TOKEN      = "esp32";
static const char* DEVICE_ID  = "device-001";
static const char* API_PATH   = "/v1/hydroponics/snapshots";

// === Cấu hình relay ===
#define RELAY_PIN       12    // GPIO12 (Relay máy bơm)

// Thời gian giữa các lần gửi (ms)
static const unsigned long LOOP_INTERVAL_MS = 3000;

// Trả về JSON mặc định khi chưa có cảm biến
String getDefaultSensorJson() {
  return "{\"sensorData\":{\"water_temperature\":25.40,\"ambient_temperature\":22.00,\"humidity\":55.00},\"solutionData\":{\"ph\":6.50,\"ec\":1.20,\"orp\":250}}";
}

// Kết nối Wi-Fi với timeout
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

// Gửi HTTP POST JSON
void sendSnapshot(const String& json) {
  WiFiClientSecure client;
  client.setInsecure();
  if (!client.connect(HOST, HTTPS_PORT)) {
    Serial.println("HTTPS connect failed");
    return;
  }

  // Tạo request header
  String request =
    String("POST ") + API_PATH + " HTTP/1.1\r\n" +
    "Host: " + HOST + "\r\n" +
    "accept: */*\r\n" +
    "x-device-token: " + TOKEN + "\r\n" +
    "x-device-id: " + DEVICE_ID + "\r\n" +
    "Content-Type: application/json\r\n" +
    "Content-Length: " + String(json.length()) + "\r\n\r\n" +
    json;

  client.print(request);

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

  connectWiFi();
}

void loop() {
  unsigned long now = millis();

  static unsigned long lastRelayToggle = 0;
  static unsigned long lastSend = 0;
  static bool pumpOn = false;

  // Toggle relay every 5000 ms
  if (now - lastRelayToggle >= 5000) {
    pumpOn = !pumpOn;
    digitalWrite(RELAY_PIN, pumpOn ? HIGH : LOW);
    Serial.println(pumpOn ? "Pump ON" : "Pump OFF");
    lastRelayToggle = now;
  }

  // Send data every LOOP_INTERVAL_MS
  if (now - lastSend >= LOOP_INTERVAL_MS) {
    String payload = getDefaultSensorJson();
    Serial.println("Sending payload: " + payload);
    sendSnapshot(payload);
    lastSend = now;
  }

  delay(10); // tránh CPU overload
}
