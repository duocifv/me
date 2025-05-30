#ifndef API_MODULE_H
#define API_MODULE_H

#include <WiFi.h>
#include <HTTPClient.h>

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

    bool begin()
    {
        // Không nên gọi setReuse(true) nếu không kiểm soát tốt kết nối
        // Nếu bạn muốn thử có thể bật lại, nhưng tốt nhất để false mặc định
        // http.setReuse(true);
        return true;
    }

    bool sendData(const char *payload, size_t length)
    {
        if (WiFi.status() != WL_CONNECTED)
        {
            Serial.println("🚫 WiFi chưa kết nối");
            return false;
        }

        http.begin(apiUrl);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-device-token", deviceToken);
        http.addHeader("x-device-id", deviceId);

        int code = http.POST((uint8_t *)payload, length);

        if (code > 0)
        {
            Serial.printf("✅ Response: %d\n", code);
            http.end(); // Đóng kết nối sau mỗi request thành công
            return true;
        }

        Serial.printf("❌ POST lỗi: %s\n", http.errorToString(code).c_str());
        http.end(); // Đóng kết nối ngay cả khi lỗi
        return false;
    }

    void endConnection()
    {
        http.end(); // Gọi khi deep sleep hoặc tắt module
    }
};

#endif // API_MODULE_H
