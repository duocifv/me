// json_builder.h
#ifndef JSON_BUILDER_H
#define JSON_BUILDER_H

#include <ArduinoJson.h>

// Tạo JSON payload dùng StaticJsonDocument và buffer tĩnh
// Kích thước 256 bytes đủ cho payload nhỏ gọn
inline size_t buildJsonSnapshots(char *buffer, size_t bufferSize,
                                 float waterTemp, float ambientTemp,
                                 float humidity, float ph, float ec, int orp)
{
    StaticJsonDocument<256> doc;

    JsonObject root = doc.to<JsonObject>();
    JsonObject sensorData = root.createNestedObject("sensorData");
    sensorData["water_temperature"] = waterTemp;
    sensorData["ambient_temperature"] = ambientTemp;
    sensorData["humidity"] = humidity;

    JsonObject solutionData = root.createNestedObject("solutionData");
    solutionData["ph"] = ph;
    solutionData["ec"] = ec;
    solutionData["orp"] = orp;

    return serializeJson(doc, buffer, bufferSize);
}

#endif // JSON_BUILDER_H