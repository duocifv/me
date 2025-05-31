#ifndef DS18B20_MODULE_H
#define DS18B20_MODULE_H

#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Chân DATA OneWire của DS18B20 (đã chọn GPIO13 trên ESP32-CAM)
#define ONE_WIRE_BUS 13

class DS18B20Module {
private:
    OneWire oneWire;           // Thư viện OneWire (Paul Stoffregen)
    DallasTemperature sensors; // Thư viện DallasTemperature

public:
    // Constructor: khởi tạo OneWire trên chân ONE_WIRE_BUS
    DS18B20Module() : oneWire(ONE_WIRE_BUS), sensors(&oneWire) {}

    // Hàm begin(): phải gọi trong setup() của file main
    void begin() {
        // Bật pull-up nội để tạm test (nếu chưa có điện trở 4.7kΩ ngoài)
        pinMode(ONE_WIRE_BUS, INPUT_PULLUP);

        // Khởi động DallasTemperature
        sensors.begin();

        // In ra số thiết bị DS18B20 tìm thấy (phục vụ debug)
        int count = sensors.getDeviceCount();
        Serial.print("DS18B20: Found ");
        Serial.print(count);
        Serial.println(" device(s) on bus.");

        // Thiết lập độ phân giải: 10-bit (khoảng 0.0625 °C, conversion ~200ms)
        sensors.setResolution(10);

        // Đợi mỗi lần requestTemperatures() xong mới tiếp tục
        sensors.setWaitForConversion(true);
    }

    // Hàm lấy nhiệt độ (trong độ C). Trả NAN nếu cảm biến ngắt/kết nối sai.
    float getTemperature() {
        // Gửi lệnh yêu cầu đo nhiệt độ
        sensors.requestTemperatures();

        // Đọc giá trị của con đầu tiên (index 0)
        float temp = sensors.getTempCByIndex(0);

        // Nếu DallasTemperature trả DEVICE_DISCONNECTED_C (−127), coi là ngắt
        if (temp == DEVICE_DISCONNECTED_C) {
            return NAN;
        }

        return temp;
    }
};

#endif // DS18B20_MODULE_H
