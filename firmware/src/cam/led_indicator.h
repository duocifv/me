#ifndef LED_INDICATOR_H
#define LED_INDICATOR_H

#include <Arduino.h>

class LedIndicator
{
    uint8_t pin;
    uint8_t remaining;
    uint16_t interval;
    unsigned long lastMillis;
    bool state;

public:
    // Constructor với tham số mặc định pin = 4
    explicit LedIndicator(uint8_t p = 4) : pin(p), remaining(0), interval(0), lastMillis(0), state(false)
    {
        pinMode(pin, OUTPUT);
        digitalWrite(pin, LOW);
    }

    void blink(uint8_t times, uint16_t msInterval)
    {
        remaining = times * 2;
        interval = msInterval;
        lastMillis = millis();
        state = false;
        digitalWrite(pin, LOW);
    }

    void off()
    {
        remaining = 0;
        digitalWrite(pin, LOW);
    }

    void update()
    {
        if (remaining == 0)
            return;
        unsigned long now = millis();
        if (now - lastMillis >= interval)
        {
            state = !state;
            digitalWrite(pin, state ? HIGH : LOW);
            lastMillis = now;
            remaining--;
            if (remaining == 0)
                digitalWrite(pin, LOW);
        }
    }
};

#endif
