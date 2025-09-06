#ifndef DS18B20_MODULE_H
#define DS18B20_MODULE_H

#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Chân DATA OneWire của DS18B20 (VD: GPIO13 trên ESP32-CAM)
#define ONE_WIRE_BUS 13

class DS18B20Module
{
private:
    OneWire oneWire;
    DallasTemperature sensors;

public:
    // Constructor
    DS18B20Module() : oneWire(ONE_WIRE_BUS), sensors(&oneWire) {}

    void begin()
    {
        sensors.begin();
        delay(1000); // 💡 Chờ cảm biến ổn định

        sensors.requestTemperatures(); // ⚠️ Gọi trước khi đếm

        int count = sensors.getDeviceCount();
        Serial.print("DS18B20: Tìm thấy ");
        Serial.print(count);
        Serial.println(" cảm biến.");

        if (count > 0)
        {
            DeviceAddress addr;
            if (sensors.getAddress(addr, 0))
            {
                Serial.print("-> Địa chỉ ROM: ");
                for (uint8_t i = 0; i < 8; i++)
                {
                    if (addr[i] < 16)
                        Serial.print("0");
                    Serial.print(addr[i], HEX);
                }
                Serial.println();
            }
        }
        else
        {
            Serial.println("⚠️ Không tìm thấy cảm biến DS18B20 nào.");
        }

        sensors.setResolution(10);          // 10-bit: 0.25°C
        sensors.setWaitForConversion(true); // Đợi xong mới đọc
    }

    float getTemperature()
    {
        sensors.requestTemperatures();
        float temp = sensors.getTempCByIndex(0);
        if (temp == DEVICE_DISCONNECTED_C)
        {
            Serial.println("⚠️ DS18B20 không kết nối hoặc lỗi.");
            return NAN;
        }
        return temp;
    }

    bool isFound()
    {
        return sensors.getDeviceCount() > 0;
    }
};

#endif // DS18B20_MODULE_H
