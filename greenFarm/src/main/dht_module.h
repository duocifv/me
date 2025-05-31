#ifndef DHT_MODULE_H
#define DHT_MODULE_H

#include <Arduino.h>
#include <DHT.h>

#define DHTPIN 16     // Chân DATA DHT22
#define DHTTYPE DHT22 // Sử dụng DHT22 (AM2302)

class DHTModule {
private:
    DHT dht;
    unsigned long lastReadTime;
public:
    // Constructor khởi tạo DHT trên chân DHTPIN
    DHTModule() : dht(DHTPIN, DHTTYPE), lastReadTime(0) {}

    // Gọi trong setup()
    void begin() {
        dht.begin();
        lastReadTime = 0;
    }

    // Đọc nhiệt độ (°C). Nếu lỗi, trả NAN.
    // Đảm bảo mỗi lần đọc cách nhau ít nhất 2000 ms.
    float getTemperature() {
        unsigned long now = millis();
        if (now - lastReadTime < 2000) {
            // Chưa đủ 2 giây, trả luôn giá trị cũ (hoặc NAN)
            return NAN;
        }
        lastReadTime = now;
        float temp = dht.readTemperature();
        // Nếu thư viện trả NAN, ta trả tiếp NAN
        if (isnan(temp)) {
            return NAN;
        }
        return temp;
    }

    // Đọc độ ẩm (%RH). Nếu lỗi, trả NAN.
    // Cùng timing với getTemperature(), tức hai hàm nên được gọi gần nhau.
    float getHumidity() {
        unsigned long now = millis();
        // Nếu getTemperature() đã cập nhật lastReadTime cách đây <2000 ms, 
        // getHumidity() cũng nên đọc luôn trong lần đó, vì DHT library đọc cả 2 chỉ một lần.
        // Tuy nhiên, nếu getHumidity() được gọi độc lập thì vẫn yêu cầu 2 giây.
        if (now - lastReadTime < 2000) {
            // Rất có thể đã đọc temperature rồi, nên gọi trực tiếp readHumidity()
            // chứ không bỏ qua.
            float hum = dht.readHumidity();
            return isnan(hum) ? NAN : hum;
        }
        // Nếu quá lâu, gọi lại readHumidity (và readTemperature) để đồng bộ timing
        lastReadTime = now;
        float hum = dht.readHumidity();
        return isnan(hum) ? NAN : hum;
    }
};

#endif // DHT_MODULE_H
