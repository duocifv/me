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

    JsonObject sensorData = root.createNestedObject("sensorData");
    sensorData["water_temperature"]   = waterTemp;
    sensorData["ambient_temperature"] = ambientTemp;
    sensorData["humidity"]            = humidity;

    JsonObject solutionData = root.createNestedObject("solutionData");
    solutionData["ph"]  = ph;
    solutionData["ec"]  = ec;
    solutionData["orp"] = orp;

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
