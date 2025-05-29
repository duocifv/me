// PumpControl.cpp
#include "PumpControl.h"
#include "config.h"
#include <Arduino.h>
static bool state = false;

void PumpControl::setup(){ pinMode(RELAY_PIN, OUTPUT); off(); }
void PumpControl::on(){ state=true; digitalWrite(RELAY_PIN, HIGH); }
void PumpControl::off(){ state=false; digitalWrite(RELAY_PIN, LOW); }
bool PumpControl::isOn(){ return state; }