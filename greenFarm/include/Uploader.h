#ifndef UPLOADER_H
#define UPLOADER_H

#include <Arduino.h>
#include <WiFiClientSecure.h>

class Uploader {
public:
  Uploader(const char* host, int port, const char* token, const char* id);
  
  // Gửi dữ liệu cảm biến + ảnh (buffer nhị phân)
  void sendSnapshot(float temp, float humid, float waterTemp, const uint8_t* imgBuf, size_t imgLen);

private:
  const char* _host;
  int _port;
  const char* _token;
  const char* _id;
  WiFiClientSecure _tlsClient;
};

#endif
