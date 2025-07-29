// schedule.h
#ifndef SCHEDULE_H
#define SCHEDULE_H

// 💧 Lịch tưới
const int PUMP_SCHEDULE[][2] = {
  { 6, 0 }, { 9, 30 }, { 13, 0 }, { 14, 40 }, { 14, 50 }, { 16, 30 }
};
const int PUMP_SCHEDULE_COUNT = sizeof(PUMP_SCHEDULE) / sizeof(PUMP_SCHEDULE[0]);
const unsigned long PUMP_DURATION = 30000;  // ms

// 🌬️ Lịch quạt
const int FAN_SCHEDULE[][2] = {
  { 7, 0 }, { 10, 0 }, { 13, 0 }, { 14, 40 }, { 14, 50 }, { 16, 0 }
};
const int FAN_SCHEDULE_COUNT = sizeof(FAN_SCHEDULE) / sizeof(FAN_SCHEDULE[0]);
const unsigned long FAN_DURATION = 30000;

// 💡 Lịch đèn
const int LED_SCHEDULE[][2] = {
  { 6, 0 }, { 6, 30 }, { 7, 0 }, { 7, 30 }, { 8, 0 }, { 8, 30 }, { 9, 0 }, { 9, 30 }, { 10, 0 }, { 10, 30 }, { 11, 0 }, { 11, 30 }, { 12, 0 }, { 12, 30 }, { 13, 0 }, { 13, 30 }, { 14, 0 }, { 14, 30 }, { 14, 40 }, { 14, 50 }, { 15, 0 }, { 15, 30 }, { 16, 0 }, { 16, 30 }, { 17, 0 }, { 17, 30 }, { 18, 0 }, { 18, 30 }, { 19, 0 }, { 19, 30 }, { 20, 0 }
};
const int LED_SCHEDULE_COUNT = sizeof(LED_SCHEDULE) / sizeof(LED_SCHEDULE[0]);
const unsigned long LED_DURATION = 30000;

#endif
