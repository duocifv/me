#ifndef CAMERA_SERVICE_H
#define CAMERA_SERVICE_H

#include "esp_camera.h"
#include <Arduino.h>

class CameraService {
public:
    /**
     * Initialize the camera with AI-Thinker ESP32-CAM pin configuration
     * @return true if initialization successful, false otherwise
     */
    bool setup();

    /**
     * Capture an image from the camera
     * @param outBuf Reference to store pointer to JPEG buffer
     * @param outLen Reference to store length of JPEG buffer
     * @return true if capture successful, false otherwise
     */
    bool captureImage(uint8_t*& outBuf, size_t& outLen);

    /**
     * Deinitialize camera and free resources
     */
    void deinit();

private:
    camera_config_t config_;
    bool initialized_ = false;
    void prepareConfig();
};

#endif // CAMERA_SERVICE_H
