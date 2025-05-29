#ifndef UPLOADER_H
#define UPLOADER_H

#include <Arduino.h>
#include <HTTPClient.h>

class Uploader
{
public:
    Uploader(const char *deviceToken, const char *deviceId);

    void sendSensorData(float waterTemp,
                        float airTemp,
                        float humidity,
                        float lightIntensity = 0.0f,
                        float ph = 0.0f,
                        float ec = 0.0f,
                        float orp = 0.0f);

    void sendImage(const char *imagePath,
                   const char *fieldName = "file",
                   const char *filename = "image.png",
                   const char *mimeType = "image/png");

private:
    const char *_token;
    const char *_deviceId;

    void addCommonHeaders(HTTPClient &http);

    // Declare boundary string
    static const char *BOUNDARY;
};

#endif // UPLOADER_H