#ifndef WIFI_MODULE_H
#define WIFI_MODULE_H

#include <WiFi.h>

class WifiModule
{
private:
    const char *ssid;
    const char *password;

public:
    WifiModule(const char *ssid, const char *password)
        : ssid(ssid), password(password) {}

    void connect()
    {
        Serial.print("Connecting to WiFi: ");
        Serial.println(ssid);

        WiFi.begin(ssid, password);

        int retries = 0;
        while (WiFi.status() != WL_CONNECTED)
        {
            delay(500);
            Serial.print(".");
            retries++;
            if (retries > 20)
            {
                Serial.println("Failed to connect");
                return;
            }
        }
        Serial.println("");
        Serial.print("Connected! IP: ");
        Serial.println(WiFi.localIP());
    }
};

#endif
