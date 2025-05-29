#ifndef WIFI_SERVICE_H
#define WIFI_SERVICE_H

#include <WiFi.h>

class WiFiService {
public:
    WiFiService(const char* ssid, const char* password);
    void connect();
    bool isConnected() const;

private:
    const char* _ssid;
    const char* _password;
};

#endif
