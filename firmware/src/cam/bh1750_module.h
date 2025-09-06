#ifndef BH1750_MODULE_H
#define BH1750_MODULE_H

#include <BH1750.h>
#include <Wire.h>

class BH1750Module {
private:
    BH1750 lightMeter;
    uint8_t sdaPin;
    uint8_t sclPin;

public:
    BH1750Module(uint8_t sda = 14, uint8_t scl = 1)
        : lightMeter(0x23), sdaPin(sda), sclPin(scl) {}

    void begin() {
        Wire.begin(sdaPin, sclPin);
        if (!lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
            Serial.println("❌ Không khởi động được BH1750!");
        } else {
            Serial.println("✅ BH1750 đã sẵn sàng.");
        }
    }

    float getLux() {
        float lux = lightMeter.readLightLevel();
        if (lux <= 0) {
            Serial.println("⚠ Lưu ý: giá trị lux có thể không hợp lệ hoặc quá thấp.");
            return 0;
        }
        return lux;
    }
};

#endif // BH1750_MODULE_H
