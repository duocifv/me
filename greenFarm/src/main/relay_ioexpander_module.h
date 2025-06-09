#include <PCF8574.h>

class RelayIOExpanderModule {
  PCF8574 expander;
  int pin;
  bool activeLow;

public:
  RelayIOExpanderModule(uint8_t addr, int pin, bool activeLow = false)
    : expander(addr), pin(pin), activeLow(activeLow) {}

  void begin() {
    expander.begin();
    // Không gọi pinMode vì thư viện không có hàm này
    // Thiết lập trạng thái chân relay ban đầu (tắt relay)
    expander.write(pin, activeLow ? HIGH : LOW);
  }

  void on() {
    expander.write(pin, activeLow ? LOW : HIGH);
  }

  void off() {
    expander.write(pin, activeLow ? HIGH : LOW);
  }
};
