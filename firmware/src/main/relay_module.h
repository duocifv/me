#ifndef RELAY_MODULE_H
#define RELAY_MODULE_H

#include <Arduino.h>

// set false nếu relay là active HIGH
#ifndef RELAY_ACTIVE_LOW
#define RELAY_ACTIVE_LOW true
#endif

// pin relay (được gán trong relayBegin)
static uint8_t _fanVentPin = 255;
static uint8_t _fanCoolPin = 255;
static uint8_t _ledPin     = 255;
static uint8_t _pumpPin    = 255;

inline void relaySet(uint8_t pin, bool on) {
  digitalWrite(pin, on ? LOW : HIGH); // tuỳ wiring, LOW = bật relay
}

inline void _relayWrite(uint8_t pin, bool on) {
  if (pin == 255) return; // chưa gán
  if (RELAY_ACTIVE_LOW)
    digitalWrite(pin, on ? LOW : HIGH);
  else
    digitalWrite(pin, on ? HIGH : LOW);
}

// khởi tạo 4 relay
inline void relayBegin(uint8_t fanVentPin, uint8_t fanCoolPin, uint8_t ledPin, uint8_t pumpPin) {
  _fanVentPin = fanVentPin;
  _fanCoolPin = fanCoolPin;
  _ledPin     = ledPin;
  _pumpPin    = pumpPin;

  pinMode(_fanVentPin, OUTPUT);
  pinMode(_fanCoolPin, OUTPUT);
  pinMode(_ledPin, OUTPUT);
  pinMode(_pumpPin, OUTPUT);

  // tất cả OFF ban đầu
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(_fanVentPin, HIGH);
    digitalWrite(_fanCoolPin, HIGH);
    digitalWrite(_ledPin, HIGH);
    digitalWrite(_pumpPin, HIGH);
  } else {
    digitalWrite(_fanVentPin, LOW);
    digitalWrite(_fanCoolPin, LOW);
    digitalWrite(_ledPin, LOW);
    digitalWrite(_pumpPin, LOW);
  }
}

// hàm điều khiển từng relay
inline void relaySetFanVent(bool on) { _relayWrite(_fanVentPin, on); }
inline void relaySetFanCool(bool on) { _relayWrite(_fanCoolPin, on); }
inline void relaySetLed(bool on)     { _relayWrite(_ledPin, on); }
inline void relaySetPump(bool on)    { _relayWrite(_pumpPin, on); }

#endif // RELAY_MODULE_H
