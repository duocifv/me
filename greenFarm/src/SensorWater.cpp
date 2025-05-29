// SensorWater.cpp
#include "SensorWater.h"
#include "config.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Arduino.h>
static OneWire oneWire(ONEWIRE_PIN);
static DallasTemperature sensors(&oneWire);

void SensorWater::setup(){ sensors.begin(); }

float SensorWater::readTemperature(){
  sensors.requestTemperatures();
  float t = sensors.getTempCByIndex(0);
  return (t==DEVICE_DISCONNECTED_C)? NAN : t;
}