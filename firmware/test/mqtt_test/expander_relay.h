#ifndef EXPANDER_RELAY_H
#define EXPANDER_RELAY_H

#include <Arduino.h>

class ExpanderRelay
{
public:
    ExpanderRelay(uint8_t pin) : _pin(pin)
    {
        pinMode(_pin, OUTPUT);
        digitalWrite(_pin, LOW); // Relay ban đầu tắt
    }

    void set(int state)
    {
        digitalWrite(_pin, state ? HIGH : LOW);
    }

    void on()
    {
        digitalWrite(_pin, HIGH);
    }

    void off()
    {
        digitalWrite(_pin, LOW);
    }

private:
    uint8_t _pin;
};

#endif // EXPANDER_RELAY_H
