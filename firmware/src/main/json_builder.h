#ifndef JSON_BUILDER_H
#define JSON_BUILDER_H

#include <ArduinoJson.h>

inline size_t buildJsonSnapshots(char *buffer, size_t bufferSize,
                                 float waterTemp, float ambientTemp,
                                 float humidity, float ph,
                                 float ec, int orp)
{
    StaticJsonDocument<256> doc;
    JsonObject root = doc.to<JsonObject>();

    // Thêm trực tiếp các field vào đối tượng gốc
    root["waterTemp"]    = waterTemp;
    root["ambientTemp"]  = ambientTemp;
    root["humidity"]     = humidity;
    root["ph"]           = ph;
    root["ec"]           = ec;
    root["orp"]          = orp;

    if (!buffer || bufferSize == 0) {
        // Trả về kích thước cần thiết
        return measureJson(doc);
    }

    size_t len = serializeJson(doc, buffer, bufferSize);
    if (len == 0 || len >= bufferSize) {
        Serial.println("❌ Lỗi serialize JSON hoặc buffer quá nhỏ");
        return 0;
    }
    return len;
}

#endif // JSON_BUILDER_H
