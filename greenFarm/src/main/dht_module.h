#ifndef DHT_MODULE_H
#define DHT_MODULE_H

#include <Arduino.h>
#include <DHT.h>

#define DHTPIN 16
#define DHTTYPE DHT22

class DHTModule {
private:
    DHT dht;
    unsigned long lastReadTime;
    float lastTemp;
    float lastHum;
    bool hasValidData;

public:
    DHTModule()
      : dht(DHTPIN, DHTTYPE),
        lastReadTime(0),
        lastTemp(NAN),
        lastHum(NAN),
        hasValidData(false) {}

    void begin() {
        dht.begin();
        lastReadTime = 0;
        hasValidData = false;
    }

    void update() {
        unsigned long now = millis();
        if (now - lastReadTime >= 2000 || !hasValidData) {
            float t = dht.readTemperature();
            float h = dht.readHumidity();

            if (!isnan(t) && !isnan(h)) {
                lastTemp = t;
                lastHum  = h;
                hasValidData = true;
            } else {
                Serial.println("⚠️ DHT22 read error");
                hasValidData = false;
            }
            lastReadTime = now;
        }
    }

    float getTemperature() const {
        return lastTemp;
    }

    float getHumidity() const {
        return lastHum;
    }

    bool hasData() const {
        return hasValidData;
    }
};

#endif // DHT_MODULE_H
