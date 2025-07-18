#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* mqtt_server = "c53388ae7eaf409088a2a30c9f69a351.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "duocnv";
const char* mqtt_pass = "Bao132132!!";

WiFiClientSecure secureClient;
PubSubClient client(secureClient);

void messageReceived(char* topic, byte* payload, unsigned int length) {
  Serial.print("📩 Tin nhắn từ topic ");
  Serial.print(topic);
  Serial.print(": ");

  String msg = "";
  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  Serial.println(msg);

   // 👉 Phản hồi lại MQTT broker
  if (msg == "Turn on the screen") {
    client.publish("esp32/response", "Screen turned on");
  }

  // 👉 Tại đây bạn có thể hiển thị nội dung `msg` lên màn hình OLED, LCD,...
  // display.clearDisplay();
  // display.setCursor(0, 0);
  // display.print(msg);
  // display.display();
}

void connectToWiFi() {
  Serial.print("🔌 Kết nối WiFi Wokwi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi OK!");
  Serial.println(WiFi.localIP());
}

void connectToMQTT() {
  client.setServer(mqtt_server, mqtt_port);
  secureClient.setInsecure(); // ⚠️ Tạm thời bỏ kiểm tra SSL

  client.setCallback(messageReceived);  // 👉 Đặt callback trước

  Serial.print("🔁 Kết nối HiveMQ...");
  if (client.connect("esp32-client-wokwi", mqtt_user, mqtt_pass)) {
    Serial.println("✅ MQTT kết nối thành công!");
    client.subscribe("esp32/screen");
  } else {
    Serial.print("❌ Lỗi MQTT: ");
    Serial.println(client.state());
  }
}



void setup() {
  Serial.begin(115200);
  connectToWiFi();
  connectToMQTT();
}

void loop() {
  if (!client.connected()) {
    Serial.println("⚠️ MQTT disconnected. Reconnecting...");
    connectToMQTT();
  }
  client.loop();

  client.publish("esp32/response", "hello from ESP32");
delay(3000); // gửi mỗi 3 giây cho dễ test

}