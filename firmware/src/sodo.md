(daisy-chain)

+5V nguồn
│
├──> VCC Relay1
│ │
│ └──> VCC Relay2
│ │
│ └──> VCC Relay3
│ │
│ └──> VCC PCF8574

GND nguồn
│
├──> GND Relay1
│ │
│ └──> GND Relay2
│ │
│ └──> GND Relay3
│ │
│ └──> GND PCF8574




+5V nguồn ─┬─> ESP32-CAM VCC
           │
           └─> DHT22 VCC
                │
                └─> DS18B20 VCC

GND nguồn ─┬─> ESP32-CAM GND
           │
           └─> DHT22 GND
                │
                └─> DS18B20 GND


================



+5V nguồn
  │
  └──> VCC Relay1
         │
         ├── [Tụ gốm 0.1µF] ↔ GND Relay1
         │
         └──> VCC Relay2
                │
                ├── [Tụ gốm 0.1µF] ↔ GND Relay2
                │
                └──> VCC Relay3
                       │
                       ├── [Tụ gốm 0.1µF] ↔ GND Relay3
                       │
                       └──> VCC PCF8574
                              │
                              ├── [Tụ gốm 0.1µF] ↔ GND PCF8574
                              │
                              └──> + chân [Tụ hóa 470–1000µF]
                                      └──> – chân nối GND

GND nguồn
  │
  └──> GND Relay1
         └──> GND Relay2
                  └──> GND Relay3
                           └──> GND PCF8574
                                    └──> GND của Tụ hóa
