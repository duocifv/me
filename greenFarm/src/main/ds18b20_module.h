#ifndef DS18B20_MODULE_H
#define DS18B20_MODULE_H

#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

class DS18B20Module {
private:
    uint8_t _oneWirePin;
    OneWire oneWire;
    DallasTemperature sensors;

public:
    // Lưu pin vào biến thành viên để sử dụng sau này
    DS18B20Module(uint8_t oneWirePin = 13) 
        : _oneWirePin(oneWirePin), oneWire(oneWirePin), sensors(&oneWire) {}

    void begin() {
        pinMode(_oneWirePin, INPUT_PULLUP);  // Pull-up nội cho chân bus
        sensors.begin();

        int count = sensors.getDeviceCount();
        Serial.printf("DS18B20: Found %d device(s) on bus.\n", count);

        if (count > 0) {
            DeviceAddress addr;
            if (sensors.getAddress(addr, 0)) {
                Serial.print("-> ROM Address: ");
                for (uint8_t i = 0; i < 8; i++) {
                    if (addr[i] < 16) Serial.print("0");
                    Serial.print(addr[i], HEX);
                }
                Serial.println();
            }
        } else {
            Serial.println("No DS18B20 device detected on bus!");
        }

        sensors.setResolution(10);
        sensors.setWaitForConversion(true);
    }

    float getTemperature(uint8_t index = 0) {
        sensors.requestTemperatures();
        float temp = sensors.getTempCByIndex(index);

        if (temp == DEVICE_DISCONNECTED_C) {
            Serial.println("❌ DS18B20 disconnected or read error");
            return NAN;
        }
        return temp;
    }

    bool isConnected() {
        return sensors.getDeviceCount() > 0;
    }
};

#endif // DS18B20_MODULE_H
