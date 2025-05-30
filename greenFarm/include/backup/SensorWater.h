// SensorWater.h
#ifndef SENSORWATER_H
#define SENSORWATER_H
#include <DallasTemperature.h>
class SensorWater {
public:
  void setup();
  float readTemperature();
};
#endif