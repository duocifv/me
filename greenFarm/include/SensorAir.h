// SensorAir.h
#ifndef SENSORAIR_H
#define SENSORAIR_H
#include <DHT.h>
class SensorAir {
public:
  void setup();
  bool read(float& temp, float& hum);
};
#endif