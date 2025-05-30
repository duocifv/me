#ifndef API_MODULE_H
#define API_MODULE_H

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

class ApiModule
{
private:
    const char *apiUrl;
    const char *deviceToken;
    const char *deviceId;
    HTTPClient http;

public:
    ApiModule(const char *url, const char *token, const char *id)
        : apiUrl(url), deviceToken(token), deviceId(id) {}

    // Trả về luôn true (không cần thiết lập state trước)
    bool begin()
    {
        return true;
    }

    // Mỗi lần gọi sẽ open + POST + parse + close
    bool sendData(const char *payload, size_t length)
    {
        if (WiFi.status() != WL_CONNECTED)
        {
            Serial.println("🚫 WiFi chưa kết nối");
            return false;
        }

        // Mở kết nối
        http.begin(apiUrl);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-device-token", deviceToken);
        http.addHeader("x-device-id", deviceId);

        // Gửi POST
        int code = http.POST((uint8_t *)payload, length);

        if (code > 0)
        {
            Serial.printf("✅ Response code: %d\n", code);
            String response = http.getString();
            Serial.println("Response body:");
            Serial.println(response);

            // Parse nếu muốn
            if (response.length() > 0)
            {
                DynamicJsonDocument doc(1024);
                auto err = deserializeJson(doc, response);
                if (err)
                {
                    Serial.print("❌ Lỗi parse JSON: ");
                    Serial.println(err.c_str());
                    http.end();
                    return false;
                }
            }

            // Đóng kết nối sau thành công
            http.end();
            return true;
        }

        // Nếu lỗi POST
        Serial.printf("❌ POST lỗi: %s\n", http.errorToString(code).c_str());
        http.end(); // Đóng kết nối ngay cả khi lỗi
        return false;
    }

    // Gọi khi deep-sleep hoặc trước khi tắt module
    void endConnection()
    {
        http.end();
    }
};

#endif // API_MODULE_H
