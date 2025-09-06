#ifndef DHT_MODULE_H
#define DHT_MODULE_H

#include <Arduino.h>
#include <DHT.h>

#ifndef DHT_DEFAULT_TYPE
    #define DHT_DEFAULT_TYPE DHT11 //   #define DHT_DEFAULT_TYPE DHT22
#endif

class DHTModule {
private:
    DHT dht;
    float lastTemp;
    float lastHum;
    unsigned long lastRead;
    bool hasData;

    bool isValid(float v) const {
        return !isnan(v);
    }

public:
    explicit DHTModule(uint8_t pin, uint8_t type = DHT_DEFAULT_TYPE)
      : dht(pin, type), lastTemp(NAN), lastHum(NAN),
        lastRead(0), hasData(false) {}

    void begin() {
        dht.begin();
    }

    // Chỉ đọc tối đa 1 lần / 2s
    void update() {
        unsigned long now = millis();
        if (now - lastRead >= 2000 || !hasData) {
            float t = dht.readTemperature();
            float h = dht.readHumidity();

            if (isValid(t) && isValid(h)) {
                lastTemp = t;
                lastHum  = h;
                hasData = true;
            } else {
                hasData = false;
                Serial.println("❌ DHT đọc lỗi hoặc không hợp lệ");
            }
            lastRead = now;
        }
    }

    float getTemperature() const { return lastTemp; }
    float getHumidity()   const { return lastHum; }
    bool available() const { return hasData; }
};

#endif // DHT_MODULE_H
