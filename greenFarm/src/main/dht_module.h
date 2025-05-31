#ifndef DHT_MODULE_H
#define DHT_MODULE_H

#include <Arduino.h>
#include <DHT.h>

#define DHTPIN 16       // Chân DATA DHT22
#define DHTTYPE DHT22   // Loại cảm biến

class DHTModule {
private:
    DHT dht;
    unsigned long lastReadTime;
    float lastTemp;
    float lastHum;
    bool hasValidData;

public:
    DHTModule() : dht(DHTPIN, DHTTYPE), lastReadTime(0), lastTemp(NAN), lastHum(NAN), hasValidData(false) {}

    void begin() {
        dht.begin();
        lastReadTime = 0;
        hasValidData = false;
    }

    // Cập nhật dữ liệu nếu đã qua 2 giây
    void update() {
        unsigned long now = millis();
        if (now - lastReadTime >= 2000 || !hasValidData) {
            float t = dht.readTemperature();
            float h = dht.readHumidity();

            if (!isnan(t) && !isnan(h)) {
                lastTemp = t;
                lastHum = h;
                hasValidData = true;
            } else {
                // Nếu lỗi, giữ nguyên dữ liệu cũ
                Serial.println("⚠️ Lỗi đọc DHT22.");
                hasValidData = false;
            }

            lastReadTime = now;
        }
    }

    // Trả về nhiệt độ gần nhất. Gọi update() trước đó để đảm bảo mới nhất.
    float getTemperature() {
        return lastTemp;
    }

    // Trả về độ ẩm gần nhất. Gọi update() trước đó để đảm bảo mới nhất.
    float getHumidity() {
        return lastHum;
    }
};

#endif // DHT_MODULE_H
