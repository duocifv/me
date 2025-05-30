#ifndef UPLOADER_H
#define UPLOADER_H

#include <Arduino.h>

class Uploader {
public:
  Uploader(const char* host, int port, const char* token, const char* deviceId);
  
  bool sendSensorData(float temp, float humid, float waterTemp);
  bool sendImage(const uint8_t* imgBuf, size_t imgLen);
  
  // ✅ THÊM DÒNG NÀY
  bool sendSnapshot(float temp, float humid, float waterTemp, const uint8_t* imgBuf, size_t imgLen);

private:
  const char* _host;
  int _port;
  const char* _token;
  const char* _deviceId;
};

#endif
