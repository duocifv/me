#ifndef DS18B20_MODULE_H
#define DS18B20_MODULE_H

#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 4

class DS18B20Module
{
private:
    OneWire oneWire;
    DallasTemperature sensors;

public:
    DS18B20Module() : oneWire(ONE_WIRE_BUS), sensors(&oneWire) {}

    void begin()
    {
        sensors.begin();
    }

    float getTemperature()
    {
        sensors.requestTemperatures();
        float temp = sensors.getTempCByIndex(0);
        return (temp == DEVICE_DISCONNECTED_C) ? 0 : temp;
    }

    void setResolution(uint8_t resolution)
    {
        sensors.setResolution(0, resolution); // sensor index 0
    }
};

#endif
