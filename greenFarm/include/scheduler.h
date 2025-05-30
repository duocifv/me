#ifndef SCHEDULER_H
#define SCHEDULER_H

#include <Arduino.h>

class Scheduler
{
    unsigned long lastTime;
    unsigned long interval;

public:
    // Constructor: truyền vào khoảng thời gian (ms)
    Scheduler(unsigned long intervalMs)
        : lastTime(0), interval(intervalMs) {}

    // Hàm kiểm tra đã đến lúc thực thi hay chưa
    bool ready()
    {
        unsigned long now = millis();
        if (now - lastTime >= interval)
        {
            lastTime = now;
            return true;
        }
        return false;
    }
};

#endif // SCHEDULER_H