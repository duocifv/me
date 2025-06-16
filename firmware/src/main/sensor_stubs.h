#ifndef SENSOR_STUBS_H
#define SENSOR_STUBS_H

#include <Arduino.h>

// Giả lập DHTModule
class DHTModule {
public:
    void begin() {}
    float getTemperature() { return 27.0; }
    float getHumidity()    { return 55.0; }
};

// Giả lập DS18B20Module
class DS18B20Module {
public:
    void begin() {}
    void setResolution(int) {}
    float getTemperature() { return 24.0; }
};

#endif // SENSOR_STUBS_H
