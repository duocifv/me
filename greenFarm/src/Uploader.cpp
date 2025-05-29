#include "Uploader.h"
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include "mbedtls/base64.h"

// Hàm encode base64 dùng mbedtls
static String base64Encode(const uint8_t* input, size_t len) {
  size_t outLen = 0;
  size_t buffSize = ((len + 2) / 3) * 4 + 1;
  unsigned char* out = (unsigned char*)malloc(buffSize);
  if (!out) return String();

  int res = mbedtls_base64_encode(out, buffSize, &outLen, input, len);
  String encoded = "";
  if (res == 0) {
    encoded = String((char*)out).substring(0, outLen);
  }
  free(out);
  return encoded;
}

// Khai báo client HTTPS chung
static WiFiClientSecure _tlsClient;

Uploader::Uploader(const char* host, int port, const char* token, const char* id)
  : _host(host), _port(port), _token(token), _id(id) {
  _tlsClient.setInsecure(); // bỏ kiểm tra SSL cert (chỉ dùng cho dev)
}

void Uploader::sendSnapshot(float temp, float humid, float waterTemp, const uint8_t* imgBuf, size_t imgLen) {
  HTTPClient http;
  String url = String("https://") + _host + ":" + String(_port) + "/upload-snapshot";

  if (!_tlsClient.connect(_host, _port)) {
    Serial.println("Connection to server failed!");
    return;
  }

  http.begin(_tlsClient, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + _token);

  // Mã hóa ảnh sang base64
  String b64Img = base64Encode(imgBuf, imgLen);

  // Tạo JSON payload
  String json = "{";
  json += "\"deviceId\":\"" + String(_id) + "\",";
  json += "\"temperature\":" + String(temp, 2) + ",";
  json += "\"humidity\":" + String(humid, 2) + ",";
  json += "\"waterTemp\":" + String(waterTemp, 2) + ",";
  json += "\"image\":\"" + b64Img + "\"";
  json += "}";

  int httpResponseCode = http.POST(json);
  if (httpResponseCode > 0) {
    String resp = http.getString();
    Serial.printf("Upload success, response: %s\n", resp.c_str());
  } else {
    Serial.printf("Upload failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}
