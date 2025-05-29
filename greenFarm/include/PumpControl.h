// PumpControl.h
#ifndef PUMPCONTROL_H
#define PUMPCONTROL_H
class PumpControl {
public:
  void setup();
  void on();
  void off();
  bool isOn();
};
#endif