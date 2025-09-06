#ifndef RELAY_MODULE_H
#define RELAY_MODULE_H

/*
  relay_module.h - Header-only relay helper with verbose printing
  - 4 relay: fanVent, fanCool, led, pump
  - CONFIG: define RELAY_ACTIVE_LOW false nếu board là active HIGH
  - CONFIG: define RELAY_VERBOSE 0 để tắt log (mặc định bật)
  Usage:
    relayBegin(p1,p2,p3,p4);
    relaySetPump(true);
    relayPrintStatus();
*/

#include <Arduino.h>

// === Cấu hình ===
#ifndef RELAY_ACTIVE_LOW
#define RELAY_ACTIVE_LOW false       // true nếu board là active LOW (LOW = ON)
#endif

#ifndef RELAY_VERBOSE
#define RELAY_VERBOSE 1          // 1 = in log, 0 = tắt log
#endif

// Giá trị đại diện cho "chưa gán pin"
constexpr int INVALID_PIN = -1;

// Biến lưu pin
static int _fanVentPin = INVALID_PIN;
static int _fanCoolPin = INVALID_PIN;
static int _ledPin     = INVALID_PIN;
static int _pumpPin    = INVALID_PIN;

// Trạng thái logic hiện tại (true = ON, false = OFF)
static bool _fanVentState = false;
static bool _fanCoolState = false;
static bool _ledState     = false;
static bool _pumpState    = false;

// Helper: mapping mức điện áp thực tế theo loại board
static inline int RELAY_ON_LEVEL()  { return RELAY_ACTIVE_LOW ? LOW  : HIGH; }
static inline int RELAY_OFF_LEVEL() { return RELAY_ACTIVE_LOW ? HIGH : LOW; }

// Nội bộ: trả tên relay theo pin (để in)
inline const char* _pinToName(int pin) {
  if (pin == _fanVentPin) return "fanVent";
  if (pin == _fanCoolPin) return "fanCool";
  if (pin == _ledPin)     return "led";
  if (pin == _pumpPin)    return "pump";
  return "unknown";
}

// Nội bộ: viết an toàn ra pin (bỏ qua nếu pin chưa gán)
// In log chi tiết mỗi lần có thay đổi
inline void _relayWrite(int pin, bool on) {
  if (pin == INVALID_PIN) {
#if RELAY_VERBOSE
    Serial.println("[relay] attempt to write INVALID_PIN -> ignored");
#endif
    return;
  }

  int level = on ? RELAY_ON_LEVEL() : RELAY_OFF_LEVEL();
  digitalWrite(pin, level);

#if RELAY_VERBOSE
  const char* name = _pinToName(pin);
  // level is LOW(0) or HIGH(1)
  Serial.printf("[relay] %s (pin=%d) -> %s (level=%s)\n",
                name, pin, on ? "ON" : "OFF", (level==LOW) ? "LOW" : "HIGH");
#endif
}

// Nội bộ: cập nhật biến trạng thái tương ứng
inline void _updateStateByPin(int pin, bool on) {
  if (pin == _fanVentPin) _fanVentState = on;
  else if (pin == _fanCoolPin) _fanCoolState = on;
  else if (pin == _ledPin) _ledState = on;
  else if (pin == _pumpPin) _pumpState = on;
}

// === Khởi tạo ===
inline void relayBegin(int fanVentPin, int fanCoolPin, int ledPin, int pumpPin) {
  _fanVentPin = fanVentPin;
  _fanCoolPin = fanCoolPin;
  _ledPin     = ledPin;
  _pumpPin    = pumpPin;

  if (_fanVentPin != INVALID_PIN) pinMode(_fanVentPin, OUTPUT);
  if (_fanCoolPin != INVALID_PIN) pinMode(_fanCoolPin, OUTPUT);
  if (_ledPin     != INVALID_PIN) pinMode(_ledPin, OUTPUT);
  if (_pumpPin    != INVALID_PIN) pinMode(_pumpPin, OUTPUT);

  // đặt OFF ngay lập tức
  if (_fanVentPin != INVALID_PIN) { digitalWrite(_fanVentPin, RELAY_OFF_LEVEL()); _fanVentState = false; }
  if (_fanCoolPin != INVALID_PIN) { digitalWrite(_fanCoolPin, RELAY_OFF_LEVEL()); _fanCoolState = false; }
  if (_ledPin     != INVALID_PIN) { digitalWrite(_ledPin,     RELAY_OFF_LEVEL()); _ledState = false; }
  if (_pumpPin    != INVALID_PIN) { digitalWrite(_pumpPin,    RELAY_OFF_LEVEL()); _pumpState = false; }

#if RELAY_VERBOSE
  Serial.println("[relay] relayBegin: pins inited -> OFF");
  Serial.printf("[relay] pins: fanVent=%d fanCool=%d led=%d pump=%d\n",
                _fanVentPin, _fanCoolPin, _ledPin, _pumpPin);
#endif
}

// === Public API: điều khiển theo pin (nếu cần gọi trực tiếp) ===
inline void relaySetPin(int pin, bool on) {
  if (pin == INVALID_PIN) return;
  _relayWrite(pin, on);
  _updateStateByPin(pin, on);
}

// === Public API: điều khiển theo tên (dễ đọc) ===
inline void relaySetFanVent(bool on) { _relayWrite(_fanVentPin, on); _fanVentState = (on && _fanVentPin != INVALID_PIN); }
inline void relaySetFanCool(bool on) { _relayWrite(_fanCoolPin, on); _fanCoolState = (on && _fanCoolPin != INVALID_PIN); }
inline void relaySetLed(bool on)     { _relayWrite(_ledPin,     on); _ledState     = (on && _ledPin     != INVALID_PIN); }
inline void relaySetPump(bool on)    { _relayWrite(_pumpPin,    on); _pumpState    = (on && _pumpPin    != INVALID_PIN); }

// === Tiện ích ===
inline void relayOffAll() {
  relaySetFanVent(false);
  relaySetFanCool(false);
  relaySetLed(false);
  relaySetPump(false);
#if RELAY_VERBOSE
  Serial.println("[relay] relayOffAll: all OFF");
#endif
}

inline void relayOnAll() {
  relaySetFanVent(true);
  relaySetFanCool(true);
  relaySetLed(true);
  relaySetPump(true);
#if RELAY_VERBOSE
  Serial.println("[relay] relayOnAll: all ON");
#endif
}

inline void relayToggleFanVent() { relaySetFanVent(!_fanVentState); }
inline void relayToggleFanCool() { relaySetFanCool(!_fanCoolState); }
inline void relayToggleLed()     { relaySetLed(!_ledState); }
inline void relayTogglePump()    { relaySetPump(!_pumpState); }

// Trạng thái truy vấn
inline bool relayIsFanVentOn() { return _fanVentState; }
inline bool relayIsFanCoolOn() { return _fanCoolState; }
inline bool relayIsLedOn()     { return _ledState; }
inline bool relayIsPumpOn()    { return _pumpState; }

// In trạng thái hiện tại của tất cả relay
inline void relayPrintStatus() {
#if RELAY_VERBOSE
  Serial.println("=== Relay status ===");
  Serial.printf("fanVent: pin=%d -> %s\n", _fanVentPin, _fanVentState ? "ON" : "OFF");
  Serial.printf("fanCool: pin=%d -> %s\n", _fanCoolPin, _fanCoolState ? "ON" : "OFF");
  Serial.printf("led    : pin=%d -> %s\n", _ledPin,     _ledState ? "ON" : "OFF");
  Serial.printf("pump   : pin=%d -> %s\n", _pumpPin,    _pumpState ? "ON" : "OFF");
  Serial.println("====================");
#endif
}

// Lấy pin (nếu cần)
inline int relayGetPinFanVent() { return _fanVentPin; }
inline int relayGetPinFanCool() { return _fanCoolPin; }
inline int relayGetPinLed()     { return _ledPin; }
inline int relayGetPinPump()    { return _pumpPin; }

#endif // RELAY_MODULE_H
