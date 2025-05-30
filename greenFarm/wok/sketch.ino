#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char *ssid = "Wokwi-GUEST";
const char *password = "";

// API info
const char *apiUrl = "https://my.duocnv.top/v1/hydroponics/snapshots";
const char *deviceToken = "esp32";
const char *deviceId = "device-001";

void setup()
{
    Serial.begin(115200);
    delay(1000);

    Serial.printf("Connecting to WiFi: %s\n", ssid);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nConnected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
}

void loop()
{
    if (WiFi.status() == WL_CONNECTED)
    {
        HTTPClient http;
        http.begin(apiUrl);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-device-token", deviceToken);
        http.addHeader("x-device-id", deviceId);

        // JSON data sample
        String jsonData = R"({
      "sensorData": {
        "ambient_temperature": 25,
        "humidity": 60
      },
      "solutionData": {
        "ph": 6.5,
        "ec": 1.2,
        "orp": 200
      }
    })";

        int httpResponseCode = http.POST(jsonData);

        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);

        if (httpResponseCode > 0)
        {
            String response = http.getString();
            Serial.println("Response from server:");
            Serial.println(response);
        }
        else
        {
            Serial.println("Error sending POST");
        }

        http.end();
    }
    else
    {
        Serial.println("WiFi not connected");
    }

    delay(10000); // gửi mỗi 10 giây
}
