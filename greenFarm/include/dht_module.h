#ifndef DHT_MODULE_H
#define DHT_MODULE_H

#include <DHT.h> // Bắt buộc phải include thư viện DHT

#define DHTPIN 16
#define DHTTYPE DHT22

class DHTModule
{
private:
    DHT dht; // dht là thành viên của lớp DHT
public:
    DHTModule() : dht(DHTPIN, DHTTYPE) {} // Khởi tạo với pin và type

    void begin()
    {
        dht.begin();
    }

    float getTemperature()
    {
        float temp = dht.readTemperature();
        return isnan(temp) ? 0 : temp;
    }

    float getHumidity()
    {
        float hum = dht.readHumidity();
        return isnan(hum) ? 0 : hum;
    }
};

#endif
