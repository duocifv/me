#ifndef SENSOR_AIR_H
#define SENSOR_AIR_H

class SensorAir {
public:
    void setup();
    void read(float& temperature, float& humidity);
};

#endif
