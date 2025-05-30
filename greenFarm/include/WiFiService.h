#ifndef WIFI_SERVICE_H
#define WIFI_SERVICE_H

class WiFiService {
public:
  WiFiService(const char* ssid, const char* pass);
  void connect();                // lần đầu
  bool reconnect();              // dùng trong loop, trả về true nếu đã kết nối
  bool isConnected();

private:
  const char* _ssid;
  const char* _pass;
  bool _firstAttempt = true;     // <--- flag lần đầu
};

#endif // WIFI_SERVICE_H
