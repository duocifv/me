#ifndef LED_INDICATOR_H
#define LED_INDICATOR_H

#include <Arduino.h>

class LedIndicator {
private:
    int ledPin;

public:
    explicit LedIndicator(int pin) : ledPin(pin) {
        pinMode(ledPin, OUTPUT);
        digitalWrite(ledPin, LOW);
    }

    // Nháy đèn 'times' lần, mỗi lần on-off 'speed' ms
    // **Lưu ý:** hàm này là blocking vì dùng delay, nên chỉ dùng trong các trường hợp chấp nhận được.
    void blink(int times, int speed = 300) {
        for (int i = 0; i < times; i++) {
            digitalWrite(ledPin, HIGH);
            delay(speed);
            digitalWrite(ledPin, LOW);
            delay(speed);
        }
        delay(1000);  // nghỉ 1 giây sau mỗi chu kỳ báo lỗi
    }

    // Bật đèn cố định
    void on() {
        digitalWrite(ledPin, HIGH);
    }

    // Tắt đèn cố định
    void off() {
        digitalWrite(ledPin, LOW);
    }
};

#endif  // LED_INDICATOR_H
