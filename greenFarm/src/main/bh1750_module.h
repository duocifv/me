#ifndef BH1750_MODULE_H
#define BH1750_MODULE_H

#include <BH1750.h>
#include <Wire.h>

class BH1750Module {
private:
    BH1750 lightMeter;
public:
    BH1750Module() : lightMeter(0x23) {}  // Default address

    void begin() {
        Wire.begin(14, 1);
        if (!lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
            Serial.println("❌ Không khởi động được BH1750!");
        } else {
            Serial.println("✅ BH1750 đã sẵn sàng.");
        }
    }

    float getLux() {
        float lux = lightMeter.readLightLevel();
        return isnan(lux) ? 0 : lux;
    }
};

#endif // BH1750_MODULE_H
