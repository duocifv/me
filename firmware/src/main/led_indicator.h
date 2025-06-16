#ifndef LED_INDICATOR_H
#define LED_INDICATOR_H

#include <Arduino.h>

class LedIndicator {
private:
    uint8_t pin;
    uint8_t blinkCount;
    uint16_t interval;
    unsigned long lastToggle;
    bool         isBlinking;
    bool         ledState;

public:
    LedIndicator(uint8_t ledPin) : pin(ledPin), blinkCount(0), interval(0),
                                   lastToggle(0), isBlinking(false), ledState(false) {
        pinMode(pin, OUTPUT);
        digitalWrite(pin, LOW);
    }

    // Lên lịch nháy `count` lần, mỗi lần cách nhau `interval` ms
    void blink(uint8_t count, uint16_t msInterval) {
        blinkCount = count * 2; // *2 để tính cả ON+OFF
        interval   = msInterval;
        lastToggle = millis();
        isBlinking = true;
        ledState   = false;
        digitalWrite(pin, LOW);
    }

    // Tắt LED (và stop blinking)
    void off() {
        isBlinking = false;
        digitalWrite(pin, LOW);
    }

    // Gọi thường xuyên trong loop()
    void update() {
        if (!isBlinking) return;

        unsigned long now = millis();
        if (now - lastToggle >= interval) {
            ledState = !ledState;
            digitalWrite(pin, ledState ? HIGH : LOW);
            lastToggle = now;
            blinkCount--;
            if (blinkCount == 0) {
                isBlinking = false;
                digitalWrite(pin, LOW);
            }
        }
    }
};

#endif // LED_INDICATOR_H
