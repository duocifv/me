
// SensorAir.cpp
#include "SensorAir.h"
#include "config.h"
#include <Arduino.h>
static DHT dht(DHT_PIN, DHT_TYPE);

void SensorAir::setup(){ dht.begin(); }

bool SensorAir::read(float& temp, float& hum) {
  temp = dht.readTemperature();
  hum  = dht.readHumidity();
  if (isnan(temp)||isnan(hum)) return false;
  return true;
}