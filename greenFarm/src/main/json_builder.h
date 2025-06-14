#ifndef JSON_BUILDER_H
#define JSON_BUILDER_H

#include <ArduinoJson.h>

inline size_t buildJsonSnapshots(char *buffer, size_t bufferSize,
                                 float waterTemp, float ambientTemp,
                                 float humidity, float ph,
                                 float ec, int orp)
{
    StaticJsonDocument<256> doc;

    doc["waterTemp"] = waterTemp;
    doc["ambientTemp"] = ambientTemp;
    doc["humidity"] = humidity;
    doc["ph"] = ph;
    doc["ec"] = ec;
    doc["orp"] = orp;

    if (!buffer || bufferSize == 0) {
        return measureJson(doc);  // Trả về kích thước cần thiết
    }

    size_t len = serializeJson(doc, buffer, bufferSize);
    if (len == 0 || len >= bufferSize) {
        Serial.println("❌ Lỗi serialize JSON hoặc buffer quá nhỏ");
        return 0;
    }

    return len;
}

#endif // JSON_BUILDER_H
