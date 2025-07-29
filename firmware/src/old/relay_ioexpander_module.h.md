#include <PCF8574.h>

class RelayIOExpanderModule
{
  static constexpr uint8_t DEFAULT_ADDR = 0x20; // Đặt địa chỉ I2C cố định tại đây
  PCF8574 expander;
  int pin;
  bool activeLow;

public:
  RelayIOExpanderModule(int pin, bool activeLow = false)
      : expander(DEFAULT_ADDR), pin(pin), activeLow(activeLow) {}

  void begin()
  {
    expander.begin();
    expander.write(pin, activeLow ? HIGH : LOW); // tắt relay ban đầu
  }

  void on()
  {
    expander.write(pin, activeLow ? LOW : HIGH);
  }

  void off()
  {
    expander.write(pin, activeLow ? HIGH : LOW);
  }

  bool readState()
  {
    return expander.read(pin) == (activeLow ? LOW : HIGH);
  }

  void toggle()
  {
    bool current = expander.read(pin);
    expander.write(pin, !current);
  }
};
