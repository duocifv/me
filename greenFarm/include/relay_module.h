#ifndef RELAY_MODULE_H
#define RELAY_MODULE_H

#include <Arduino.h>

class RelayModule
{
private:
    uint8_t pin;
    bool activeLow;

public:
    RelayModule(uint8_t relayPin, bool isActiveLow = true)
        : pin(relayPin), activeLow(isActiveLow)
    {
        pinMode(pin, OUTPUT);
        turnOff(); // Tắt relay mặc định
    }

    void turnOn()
    {
        digitalWrite(pin, activeLow ? LOW : HIGH);
    }

    void turnOff()
    {
        digitalWrite(pin, activeLow ? HIGH : LOW);
    }

    void toggle()
    {
        digitalWrite(pin, !digitalRead(pin));
    }

    bool isOn() const
    {
        return digitalRead(pin) == (activeLow ? LOW : HIGH);
    }
};

#endif // RELAY_MODULE_H
