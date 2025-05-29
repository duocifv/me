#include "Uploader.h"
#include <WiFi.h>
#include <FS.h>
#include <SPIFFS.h>

// Define boundary string
const char *Uploader::BOUNDARY = "----ESP32FormBoundary";

Uploader::Uploader(const char *deviceToken, const char *deviceId)
    : _token(deviceToken), _deviceId(deviceId)
{
}

void Uploader::addCommonHeaders(HTTPClient &http)
{
    http.addHeader("x-device-token", _token);
    http.addHeader("x-device-id", _deviceId);
}

void Uploader::sendSensorData(float waterTemp,
                              float airTemp,
                              float humidity,
                              float lightIntensity,
                              float ph,
                              float ec,
                              float orp)
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println(F("⚠️ WiFi chưa kết nối, không gửi được sensor data"));
        return;
    }

    HTTPClient http;
    http.begin("https://my.duocnv.top/v1/hydroponics/snapshots");
    http.addHeader("Content-Type", "application/json");
    addCommonHeaders(http);

    // Build JSON payload
    char buf[256];
    int len = snprintf(buf, sizeof(buf),
                       "{\"sensorData\":{\"water_temperature\":%.2f,\"ambient_temperature\":%.2f,\"humidity\":%.2f,\"light_intensity\":%.2f},"
                       "\"solutionData\":{\"ph\":%.2f,\"ec\":%.2f,\"orp\":%.2f}}",
                       waterTemp, airTemp, humidity, lightIntensity, ph, ec, orp);

    int code = http.POST((uint8_t *)buf, len);
    Serial.printf("Sensor POST => code: %d\n", code);
    if (code > 0)
    {
        Serial.println(http.getString());
    }
    http.end();
}

void Uploader::sendImage(const char *imagePath,
                         const char *fieldName,
                         const char *filename,
                         const char *mimeType)
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println(F("⚠️ WiFi chưa kết nối, không gửi được image"));
        return;
    }
    if (!SPIFFS.begin(true))
    {
        Serial.println(F("⚠️ SPIFFS mount failed"));
        return;
    }

    File file = SPIFFS.open(imagePath, "r");
    if (!file || file.isDirectory())
    {
        Serial.println(F("⚠️ Image file not found"));
        return;
    }

    size_t imgSize = file.size();
    uint8_t *imgBuf = (uint8_t *)malloc(imgSize);
    if (!imgBuf)
    {
        file.close();
        Serial.println(F("⚠️ Không đủ bộ nhớ để đọc ảnh"));
        return;
    }
    file.read(imgBuf, imgSize);
    file.close();

    // Build multipart header and footer
    String header = String("--") + BOUNDARY + "\r\n";
    header += String("Content-Disposition: form-data; name=\"") + fieldName + "\"; filename=\"" + filename + "\"\r\n";
    header += String("Content-Type: ") + mimeType + "\r\n\r\n";
    String footer = String("\r\n--") + BOUNDARY + "--\r\n";

    size_t headerLen = header.length();
    size_t footerLen = footer.length();
    size_t totalLen = headerLen + imgSize + footerLen;

    uint8_t *body = (uint8_t *)malloc(totalLen);
    if (!body)
    {
        free(imgBuf);
        Serial.println(F("⚠️ Không đủ bộ nhớ để xây dựng body"));
        return;
    }
    memcpy(body, header.c_str(), headerLen);
    memcpy(body + headerLen, imgBuf, imgSize);
    memcpy(body + headerLen + imgSize, footer.c_str(), footerLen);
    free(imgBuf);

    HTTPClient http;
    http.begin("https://my.duocnv.top/v1/hydroponics/snapshots/images");
    http.addHeader("Content-Type", String("multipart/form-data; boundary=") + BOUNDARY);
    addCommonHeaders(http);

    int code = http.POST(body, totalLen);
    Serial.printf("Image POST => code: %d\n", code);
    if (code > 0)
    {
        Serial.println(http.getString());
    }
    http.end();
    free(body);
}
