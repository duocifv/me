// WiFiService.h
#ifndef WIFISERVICE_H
#define WIFISERVICE_H

#include <WiFi.h>

class WiFiService {
public:
  WiFiService(const char* ssid, const char* pass);
  void connect();
  bool isConnected();
private:
  const char* _ssid;
  const char* _pass;
};
#endif