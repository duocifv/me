// File: expander_relay.h
#ifndef EXPANDER_RELAY_H
#define EXPANDER_RELAY_H

#include <Wire.h>
#include <PCF8574.h>

// —— Configuration defaults ——
#define DEFAULT_SDA_PIN    2
#define DEFAULT_SCL_PIN   14
#define DEFAULT_PCF_ADDR 0x20
#define DEFAULT_ACTIVE_LOW true

class ExpanderRelay {
  PCF8574 pcf;
  uint8_t pinNum;
  bool activeLow;
  bool initialized = false;

public:
  ExpanderRelay(uint8_t pinIndex)
    : pcf(DEFAULT_PCF_ADDR), pinNum(pinIndex), activeLow(DEFAULT_ACTIVE_LOW) {}

  bool begin() {
    Wire.begin(DEFAULT_SDA_PIN, DEFAULT_SCL_PIN);
    if (!pcf.begin()) return false;

    // Không tác động trạng thái relay ở đây để tránh bật nhầm
    initialized = true;
    return true;
  }

  void on() {
    if (!initialized) return;
    pcf.write(pinNum, activeLow ? LOW : HIGH);
  }

  void off() {
    if (!initialized) return;
    pcf.write(pinNum, activeLow ? HIGH : LOW);
  }

  void toggle() {
    if (!initialized) return;
    bool state = pcf.read(pinNum);
    pcf.write(pinNum, !state);
  }

  bool isOn() {
    if (!initialized) return false;
    bool val = pcf.read(pinNum);
    return activeLow ? (val == LOW) : (val == HIGH);
  }
};

#endif // EXPANDER_RELAY_H
