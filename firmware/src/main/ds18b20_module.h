#ifndef DS18B20_MODULE_H
#define DS18B20_MODULE_H

#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Chân DATA OneWire của DS18B20 (VD: GPIO13 trên ESP32-CAM)
#define ONE_WIRE_BUS 13

class DS18B20Module {
private:
    OneWire oneWire;
    DallasTemperature sensors;

public:
    // Constructor
    DS18B20Module() : oneWire(ONE_WIRE_BUS), sensors(&oneWire) {}

    void begin() {
        // Không cần pinMode(ONE_WIRE_BUS, INPUT_PULLUP); nếu đã có điện trở 4.7kΩ ngoài

        sensors.begin();

        int count = sensors.getDeviceCount();
        Serial.print("DS18B20: Tìm thấy ");
        Serial.print(count);
        Serial.println(" cảm biến.");

        if (count > 0) {
            DeviceAddress addr;
            if (sensors.getAddress(addr, 0)) {
                Serial.print("-> Địa chỉ ROM: ");
                for (uint8_t i = 0; i < 8; i++) {
                    if (addr[i] < 16) Serial.print("0");
                    Serial.print(addr[i], HEX);
                }
                Serial.println();
            }
        } else {
            Serial.println("⚠️ Không tìm thấy cảm biến DS18B20 nào.");
        }

        sensors.setResolution(10);               // 10-bit: chính xác 0.25°C, tốc độ ~200ms
        sensors.setWaitForConversion(true);      // Chờ đo xong rồi mới đọc
    }

    // Trả về nhiệt độ C, hoặc NAN nếu không đọc được
    float getTemperature() {
        sensors.requestTemperatures();           // Yêu cầu đo
        float temp = sensors.getTempCByIndex(0); // Đọc từ cảm biến đầu tiên

        if (temp == DEVICE_DISCONNECTED_C) {
            Serial.println("⚠️ DS18B20 không kết nối hoặc lỗi.");
            return NAN;
        }

        return temp;
    }
};

#endif // DS18B20_MODULE_H
