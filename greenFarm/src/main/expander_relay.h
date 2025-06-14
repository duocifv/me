// File: ExpanderRelay.h
#ifndef EXPANDER_RELAY_H
#define EXPANDER_RELAY_H

#include <Wire.h>
#include <PCF8574.h>

// —— Configuration defaults ——
#define DEFAULT_SDA_PIN    2
#define DEFAULT_SCL_PIN   14
#define DEFAULT_PCF_ADDR 0x20   // địa chỉ cố định của PCF8574
#define DEFAULT_ACTIVE_LOW true

class ExpanderRelay {
  PCF8574 pcf;
  uint8_t pinNum;
  bool activeLow;

public:
  // pinIndex: số chân (0–7) trên PCF8574
  ExpanderRelay(uint8_t pinIndex)
    : pcf(DEFAULT_PCF_ADDR), pinNum(pinIndex), activeLow(DEFAULT_ACTIVE_LOW) {}

  // Khởi I2C & PCF8574
  bool begin() {
    Wire.begin(DEFAULT_SDA_PIN, DEFAULT_SCL_PIN);
    if (!pcf.begin()) return false;
    off();  // đảm bảo tắt relay
    return true;
  }

  void on() {
    pcf.write(pinNum, activeLow ? LOW : HIGH);
  }

  void off() {
    pcf.write(pinNum, activeLow ? HIGH : LOW);
  }

  void toggle() {
    bool state = pcf.read(pinNum);
    pcf.write(pinNum, !state);
  }

  bool isOn() {
    bool val = pcf.read(pinNum);
    return activeLow ? (val == LOW) : (val == HIGH);
  }
};

#endif // EXPANDER_RELAY_H