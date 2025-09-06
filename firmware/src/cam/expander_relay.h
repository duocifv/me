#ifndef EXPANDER_RELAY_H
#define EXPANDER_RELAY_H

#include <Wire.h>
#include <PCF8574.h>

// —— Configuration defaults ——
#define DEFAULT_SDA_PIN     2
#define DEFAULT_SCL_PIN     14
#define DEFAULT_PCF_ADDR    0x20
#define DEFAULT_ACTIVE_LOW  true

// PCF8574 dùng chung toàn cục trong module
static PCF8574 sharedPCF(DEFAULT_PCF_ADDR);

class ExpanderRelay {
  uint8_t pinNum;
  bool activeLow;

public:
  ExpanderRelay(uint8_t pinIndex, bool activeLowFlag = DEFAULT_ACTIVE_LOW)
    : pinNum(pinIndex), activeLow(activeLowFlag) {}

  static bool beginBus() {
    Wire.begin(DEFAULT_SDA_PIN, DEFAULT_SCL_PIN);
    return sharedPCF.begin();
  }

  void on() {
    sharedPCF.write(pinNum, activeLow ? LOW : HIGH);
  }

  void off() {
    sharedPCF.write(pinNum, activeLow ? HIGH : LOW);
  }

  void toggle() {
    bool state = sharedPCF.read(pinNum);
    sharedPCF.write(pinNum, !state);
  }

  bool isOn() {
    bool val = sharedPCF.read(pinNum);
    return activeLow ? (val == LOW) : (val == HIGH);
  }
  
  void set(bool state) {
    if (state) on();
    else off();
  }

};

#endif // EXPANDER_RELAY_H
