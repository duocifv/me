#include "PumpControl.h"
#include <Arduino.h>

void PumpControl::setup() {
    pinMode(5, OUTPUT); 
    off();
}

void PumpControl::on() {
    digitalWrite(5, HIGH);
    _isOn = true;
}

void PumpControl::off() {
    digitalWrite(5, LOW);
    _isOn = false;
}
