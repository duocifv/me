#ifndef CAMERA_SERVICE_H
#define CAMERA_SERVICE_H

#include <Arduino.h>
#include "esp_camera.h"

class CameraService {
public:
  CameraService() : initialized_(false) {}

  bool setup();
  camera_fb_t* captureImage();
  void deinit();

private:
  void prepareConfig();

  camera_config_t config_;
  bool initialized_;
};

#endif
