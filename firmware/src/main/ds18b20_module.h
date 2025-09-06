#ifndef DS18B20_MODULE_H
#define DS18B20_MODULE_H

#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

class DS18B20Module {
private:
    OneWire oneWire;
    DallasTemperature sensors;
    bool initialized;

public:
    explicit DS18B20Module(uint8_t pin)
      : oneWire(pin), sensors(&oneWire), initialized(false) {}

    void begin() {
        if (initialized) return;
        sensors.begin();
        sensors.setResolution(10);
        initialized = true;
    }

    float getTemperature() {
        if (!initialized) return NAN;
        sensors.requestTemperatures();
        float t = sensors.getTempCByIndex(0);
        return (t == DEVICE_DISCONNECTED_C) ? NAN : t;
    }

    bool isFound() {
        return initialized && sensors.getDeviceCount() > 0;
    }
};

#endif // DS18B20_MODULE_H
