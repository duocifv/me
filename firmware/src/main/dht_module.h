#ifndef DHT_MODULE_H
#define DHT_MODULE_H

#include <Arduino.h>
#include <DHT.h>

#define DHTPIN 12        // GPIO dùng để đọc DHT22
#define DHTTYPE DHT22    // Kiểu cảm biến

class DHTModule {
private:
    DHT dht;
    unsigned long lastReadTime;
    float lastTemp;
    float lastHum;
    bool hasValidData;

    // Kiểm tra dữ liệu có nằm trong khoảng hợp lý không
    bool isValid(float val) {
        return !isnan(val) && val > -40 && val < 100;
    }

public:
    DHTModule() :
        dht(DHTPIN, DHTTYPE),
        lastReadTime(0),
        lastTemp(NAN),
        lastHum(NAN),
        hasValidData(false) {}

    void begin() {
        dht.begin();
        lastReadTime = 0;
        hasValidData = false;
    }

    // Cập nhật giá trị nếu đã qua 2s
    void update() {
        unsigned long now = millis();
        if (now - lastReadTime >= 2000 || !hasValidData) {
            float t = dht.readTemperature();
            float h = dht.readHumidity();

            if (isValid(t) && isValid(h)) {
                lastTemp = t;
                lastHum  = h;
                hasValidData = true;
            } else {
                Serial.println("❌ DHT22: Dữ liệu không hợp lệ hoặc lỗi đọc.");
                hasValidData = false;
            }

            lastReadTime = now;
        }
    }

    float getTemperature() const { return lastTemp; }
    float getHumidity() const { return lastHum; }
    bool hasData() const { return hasValidData; }
};

#endif // DHT_MODULE_H
