bool shouldTurnOnLed(struct tm timeinfo, JsonDocument& schedule) {
  JsonArray slots = schedule["schedule"]["led"]["slots"];
  for (JsonObject slot : slots) {
    String startStr = slot["start"];
    String endStr = slot["end"];

    int startHour = startStr.substring(0, 2).toInt();
    int startMin  = startStr.substring(3, 5).toInt();
    int endHour   = endStr.substring(0, 2).toInt();
    int endMin    = endStr.substring(3, 5).toInt();

    int nowMinutes = timeinfo.tm_hour * 60 + timeinfo.tm_min;
    int startMinutes = startHour * 60 + startMin;
    int endMinutes   = endHour * 60 + endMin;

    if (nowMinutes >= startMinutes && nowMinutes < endMinutes) {
      return true;
    }
  }
  return false;
}



bool shouldTurnOnPump(struct tm timeinfo, JsonDocument& schedule) {
  JsonArray times = schedule["schedule"]["pump"]["times"];
  char currentTime[6];
  sprintf(currentTime, "%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min);

  for (const char* t : times) {
    if (strcmp(currentTime, t) == 0) {
      return true;
    }
  }
  return false;
}



if (shouldTurnOnLed(timeinfo, schedule)) {
  ledRelay.on();
} else {
  ledRelay.off();
}

if (shouldTurnOnPump(timeinfo, schedule)) {
  pumpRelay.on();
  delay(schedule["schedule"]["pump"]["duration_seconds"].as<int>() * 1000);
  pumpRelay.off();
}





{
  "led": ["06:00-06:30", "10:00-10:30", "14:00-14:30", "18:00-18:30"],
  "fan": ["06:45-07:00", "09:00-09:15", "12:00-12:15", "15:00-15:15", "17:00-17:15", "20:00-20:15"],
  "pump": {
    "times": ["06:05", "11:05", "15:05", "19:05"],
    "duration": 10
  },
  "sensor_upload_interval": 5,
  "camera_times": ["06:10", "09:10", "12:10", "15:10", "18:10", "21:10"],
  "quiet_hours": "22:00-06:00"
}


Dưới đây là thiết kế chuẩn vòng lặp loop() cho ESP32 nhằm đảm bảo:

Ổn định, không bị treo, không bị reset watchdog

Dễ mở rộng lịch hoạt động

Xử lý tách biệt từng chức năng: sensor, camera, relay,...

Tổng loop() mỗi vòng	< 2 giây

⏱ Thời gian hợp lý cho setup() trên ESP32 CAM nên dưới 8–10 giây, để đảm bảo:

Không bị Watchdog reset (nếu không feed WDT).


