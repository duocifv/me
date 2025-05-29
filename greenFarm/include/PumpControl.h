#ifndef PUMP_CONTROL_H
#define PUMP_CONTROL_H

class PumpControl {
public:
    void setup();
    void on();
    void off();
    bool isOn() const { return _isOn; }

private:
    bool _isOn = false;
};

#endif
