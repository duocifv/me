CẢM BIẾN ĐỘ ẨM HR202L
https://dientuvietduc.com/search/?search=HR202L

dự phòng: MODULE CẢM BIẾN ĐỘ ẨM HR202
https://dientuvietduc.com/product/module-c%E1%BA%A3m-bi%E1%BA%BFn-%C4%91%E1%BB%99-%E1%BA%A9m-hr202/

PIN 3.7V450mAh
https://dientuvietduc.com/search/?search=pin+3.7V

MẠCH SẠC PIN 18650 TP4056 CÓ BẢO VỆ
https://dientuvietduc.com/search/?search=TP4056

=============================

ARDUINO ATTINY85 USB DIGISPARK
https://dientubachviet.com/module-aduino-attiny85

9056-TS DIP Buzzer tần số
https://dientubachviet.com/9056-ts-dip-buzzer-tan-so

TRỞ 1/4W 1% 100K
https://dientubachviet.com/tro-1-4w-bich-20-con-cac-loai

=============================

#include <avr/sleep.h>
#include <avr/wdt.h>

#define SENSOR_PIN A1 // Đọc cảm biến HR202L (qua cầu phân áp)
#define BUZZER_PIN 0 // Buzzer nối chân số 0
#define THRESHOLD 400 // Ngưỡng độ ẩm (tùy chỉnh theo thực tế)

volatile bool shouldWakeUp = false;

// ISR của watchdog: chỉ dùng để đánh thức khỏi sleep
ISR(WDT_vect) {
shouldWakeUp = true;
}

void setupWatchdogTimer() {
MCUSR = 0;
// WDTCSR = Watchdog Timer Control Register
WDTCSR |= (1 << WDCE) | (1 << WDE); // Cho phép thay đổi WDT
WDTCSR = (1 << WDIE) | (1 << WDP3); // Bật ngắt (interrupt), timeout ~4s

// WDP3 = 4s, sleep 4s mỗi lần → 30s = 7 chu kỳ
}

void enterSleep() {
set_sleep_mode(SLEEP_MODE_PWR_DOWN);
sleep_enable();
sleep_cpu(); // Ngủ tới khi bị ngắt đánh thức (WDT)
sleep_disable();
}

void beepBuzzer(int times) {
for (int i = 0; i < times; i++) {
digitalWrite(BUZZER_PIN, HIGH);
delay(150);
digitalWrite(BUZZER_PIN, LOW);
delay(150);
}
}

void setup() {
pinMode(BUZZER_PIN, OUTPUT);
pinMode(SENSOR_PIN, INPUT);
setupWatchdogTimer();
}

void loop() {
// Kiểm tra 30 giây bằng cách sleep 7 lần, mỗi lần 4 giây
for (int i = 0; i < 7; i++) {
shouldWakeUp = false;
enterSleep(); // ngủ 4 giây
while (!shouldWakeUp); // chờ WDT gọi dậy
}

// Sau 30 giây → kiểm tra cảm biến
int value = analogRead(SENSOR_PIN);
if (value > THRESHOLD) {
// Nếu phát hiện ẩm → kêu 10 lần
beepBuzzer(10);
}
}
