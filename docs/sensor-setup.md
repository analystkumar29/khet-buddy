# KhetBuddy Soil Sensor Setup Guide

## Hardware Purchase List

| # | Item | Model | Price (INR) | Where to Buy |
|---|------|-------|-------------|--------------|
| 1 | Microcontroller | ESP32 DevKit V1 (30-pin) | ₹350-500 | Amazon.in, Robu.in |
| 2 | Soil Moisture | Capacitive Soil Moisture Sensor v2.0 | ₹250-400 | Robu.in, Amazon.in |
| 3 | NPK Sensor | RS485 Soil NPK Sensor (7-pin, 12V) | ₹2,500-3,500 | Amazon.in, IndiaMART |
| 4 | RS485 Converter | MAX485 TTL to RS485 Module | ₹80-150 | Robu.in, Amazon.in |
| 5 | pH Sensor | Analog pH Sensor Kit (with BNC probe) | ₹500-800 | Amazon.in, Robu.in |
| 6 | Temp + Humidity | DHT22 (AM2302) | ₹200-350 | Amazon.in, Robu.in |
| 7 | Soil Temperature | DS18B20 Waterproof Probe (1m cable) | ₹120-200 | Amazon.in, Robu.in |
| 8 | Power Supply | 12V 2A DC Adapter + LM2596 Buck Converter | ₹200-400 | Amazon.in |
| 9 | Misc | Jumper wires, waterproof box (IP65), connectors | ₹200-400 | Local electronics shop |
| **Total** | | | **₹4,400-6,700** | |

### Search Terms for Shopping
- "ESP32 DevKit V1 30 pin" on Amazon.in
- "Capacitive soil moisture sensor v2" on Robu.in
- "RS485 soil NPK sensor agriculture" on Amazon.in or IndiaMART
- "MAX485 module Arduino" on Robu.in
- "pH sensor Arduino BNC" on Amazon.in
- "DHT22 sensor module" on Amazon.in
- "DS18B20 waterproof probe" on Amazon.in
- "LM2596 buck converter module" on Amazon.in
- "ABS waterproof junction box 150x100x70mm" on Amazon.in

---

## Wiring Diagram

```
                    ┌─────────────────────┐
                    │     ESP32 DevKit     │
                    │                      │
   12V Adapter ────▶│ VIN          GPIO 34 │◀── Capacitive Moisture (AOUT)
         GND ──────▶│ GND          GPIO 35 │◀── pH Sensor (Analog Out)
                    │              GPIO 4  │◀── DHT22 (Data)
                    │              GPIO 5  │◀── DS18B20 (Data)
                    │              GPIO 16 │──▶ MAX485 (RO → RX)
                    │              GPIO 17 │──▶ MAX485 (DI → TX)
                    │              GPIO 18 │──▶ MAX485 (DE + RE)
                    │              GPIO 2  │──▶ LED (status indicator)
                    └─────────────────────┘

   MAX485 Module:
   ┌──────────┐
   │  MAX485  │
   │ RO ── GPIO 16 (ESP32 RX2)
   │ DI ── GPIO 17 (ESP32 TX2)
   │ DE ── GPIO 18 (tied together)
   │ RE ── GPIO 18 (tied together)
   │ VCC ── 3.3V (ESP32)
   │ GND ── GND
   │ A ──── NPK Sensor (RS485 A+)
   │ B ──── NPK Sensor (RS485 B-)
   └──────────┘

   NPK Sensor (7-pin):
   - Red wire ── 12V (from adapter, NOT ESP32)
   - Black wire ── GND (common with ESP32)
   - Yellow wire ── RS485 A+ (to MAX485 A)
   - Blue wire ── RS485 B- (to MAX485 B)
   - Other wires ── not connected

   Capacitive Moisture Sensor:
   - VCC ── 3.3V
   - GND ── GND
   - AOUT ── GPIO 34

   pH Sensor:
   - VCC ── 3.3V (or 5V via VIN)
   - GND ── GND
   - Analog Out ── GPIO 35

   DHT22:
   - VCC ── 3.3V
   - GND ── GND
   - Data ── GPIO 4 (with 10kΩ pull-up to 3.3V)

   DS18B20:
   - Red ── 3.3V
   - Black ── GND
   - Yellow (Data) ── GPIO 5 (with 4.7kΩ pull-up to 3.3V)

   IMPORTANT:
   - NPK sensor needs 12V. DO NOT connect 12V to ESP32 pins!
   - Share GND between ESP32, sensors, and 12V adapter.
   - Use LM2596 buck converter to step 12V → 5V for ESP32 VIN.
```

---

## ESP32 Firmware (Arduino IDE)

### Prerequisites
1. Install [Arduino IDE](https://www.arduino.cc/en/software)
2. Add ESP32 Board: File → Preferences → Additional Board URLs:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Install libraries (Tools → Manage Libraries):
   - `DHT sensor library` by Adafruit
   - `OneWire` by Paul Stoffregen
   - `DallasTemperature` by Miles Burton
   - `ArduinoJson` by Benoit Blanchon
   - `HTTPClient` (built-in with ESP32)

### Firmware Code

Copy this into Arduino IDE, update WiFi credentials, and flash to ESP32:

```cpp
/*
 * KhetBuddy Soil Sensor Firmware
 * ESP32 + Capacitive Moisture + NPK (RS485) + pH + DHT22 + DS18B20
 *
 * Posts soil readings to KhetBuddy API every 30 minutes.
 * Deep sleeps between readings to conserve power.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ============ CONFIGURATION — EDIT THESE ============
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_URL       = "https://khet-buddy-two.vercel.app/api/soil/readings";
const int   SLEEP_MINUTES = 30;  // Deep sleep duration
// =====================================================

// Pin definitions
#define MOISTURE_PIN    34   // Capacitive moisture sensor (analog)
#define PH_PIN          35   // pH sensor (analog)
#define DHT_PIN         4    // DHT22 data
#define DS18B20_PIN     5    // DS18B20 data
#define RS485_RX        16   // MAX485 RO
#define RS485_TX        17   // MAX485 DI
#define RS485_DE_RE     18   // MAX485 DE+RE (direction control)
#define LED_PIN         2    // Built-in LED

// Sensor setup
DHT dht(DHT_PIN, DHT22);
OneWire oneWire(DS18B20_PIN);
DallasTemperature ds18b20(&oneWire);

// NPK Modbus commands (standard RS485 queries)
byte nitrogenQuery[]   = {0x01, 0x03, 0x00, 0x1E, 0x00, 0x01, 0xE4, 0x0C};
byte phosphorusQuery[] = {0x01, 0x03, 0x00, 0x1F, 0x00, 0x01, 0xB5, 0xCC};
byte potassiumQuery[]  = {0x01, 0x03, 0x00, 0x20, 0x00, 0x01, 0x85, 0xC0};

String getDeviceId() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char macStr[18];
  snprintf(macStr, sizeof(macStr), "%02X:%02X:%02X:%02X:%02X:%02X",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(macStr);
}

float readMoisture() {
  int raw = analogRead(MOISTURE_PIN);
  // Calibration: dry air ~3500, water ~1500 (adjust for your sensor)
  float pct = map(raw, 3500, 1500, 0, 100);
  return constrain(pct, 0, 100);
}

float readpH() {
  int raw = analogRead(PH_PIN);
  // Calibration: pH 7 buffer ~2048, pH 4 ~3071, pH 10 ~1024
  // Adjust these values after calibrating with buffer solutions
  float voltage = raw * (3.3 / 4095.0);
  float ph = 7.0 + ((2.5 - voltage) / 0.18);
  return constrain(ph, 0, 14);
}

int readNPK(byte* query, int len) {
  digitalWrite(RS485_DE_RE, HIGH);  // Transmit mode
  delay(10);
  Serial2.write(query, len);
  Serial2.flush();
  digitalWrite(RS485_DE_RE, LOW);   // Receive mode
  delay(200);

  if (Serial2.available() >= 7) {
    byte response[7];
    Serial2.readBytes(response, 7);
    return (response[3] << 8) | response[4];  // Value in mg/kg
  }
  return -1;  // Error
}

void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, RS485_RX, RS485_TX);

  pinMode(RS485_DE_RE, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(RS485_DE_RE, LOW);

  dht.begin();
  ds18b20.begin();

  // Connect WiFi
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nWiFi failed! Sleeping...");
    blinkLED(5, 200);  // Fast blink = error
    esp_sleep_enable_timer_wakeup(SLEEP_MINUTES * 60 * 1000000ULL);
    esp_deep_sleep_start();
  }

  Serial.println("\nWiFi connected!");
  Serial.print("Device ID: ");
  Serial.println(getDeviceId());
  Serial.println(">>> Register this Device ID in KhetBuddy app <<<");

  // Read all sensors
  float moisture = readMoisture();
  float ph = readpH();
  float humidity = dht.readHumidity();
  float airTemp = dht.readTemperature();
  ds18b20.requestTemperatures();
  float soilTemp = ds18b20.getTempCByIndex(0);
  int nitrogen = readNPK(nitrogenQuery, 8);
  int phosphorus = readNPK(phosphorusQuery, 8);
  int potassium = readNPK(potassiumQuery, 8);

  Serial.printf("Moisture: %.1f%%\n", moisture);
  Serial.printf("pH: %.1f\n", ph);
  Serial.printf("Humidity: %.1f%%\n", humidity);
  Serial.printf("Air Temp: %.1f°C\n", airTemp);
  Serial.printf("Soil Temp: %.1f°C\n", soilTemp);
  Serial.printf("N: %d ppm, P: %d ppm, K: %d ppm\n", nitrogen, phosphorus, potassium);

  // Build JSON
  JsonDocument doc;
  doc["device_id"] = getDeviceId();
  doc["moisture_pct"] = round(moisture * 10) / 10.0;
  if (nitrogen >= 0) doc["nitrogen_ppm"] = nitrogen;
  if (phosphorus >= 0) doc["phosphorus_ppm"] = phosphorus;
  if (potassium >= 0) doc["potassium_ppm"] = potassium;
  doc["ph"] = round(ph * 10) / 10.0;
  doc["temperature_c"] = (soilTemp > -50) ? round(soilTemp * 10) / 10.0 : round(airTemp * 10) / 10.0;
  doc["humidity_pct"] = round(humidity * 10) / 10.0;

  String json;
  serializeJson(doc, json);
  Serial.println("Sending: " + json);

  // POST to KhetBuddy
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(json);
  String response = http.getString();
  http.end();

  if (httpCode == 201) {
    Serial.println("Success!");
    blinkLED(2, 500);  // Slow blink = success
  } else {
    Serial.printf("Error %d: %s\n", httpCode, response.c_str());
    blinkLED(5, 200);  // Fast blink = error
  }

  // Deep sleep
  Serial.printf("Sleeping for %d minutes...\n", SLEEP_MINUTES);
  esp_sleep_enable_timer_wakeup(SLEEP_MINUTES * 60 * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Never reached — ESP32 resets after deep sleep
}
```

---

## Step-by-Step Setup Instructions

### For the farmer (in simple terms):

1. **Buy the parts** from the list above (₹4,400-6,700 total)

2. **Connect the wires** following the wiring diagram:
   - Moisture sensor → GPIO 34
   - pH sensor → GPIO 35
   - DHT22 → GPIO 4
   - DS18B20 → GPIO 5
   - NPK sensor → MAX485 → GPIO 16/17/18
   - 12V adapter → NPK sensor + buck converter → ESP32

3. **Install Arduino IDE** on your computer (free download)

4. **Flash the firmware**:
   - Open Arduino IDE
   - Paste the firmware code above
   - Change `YOUR_WIFI_NAME` and `YOUR_WIFI_PASSWORD`
   - Select Board: "ESP32 Dev Module"
   - Click Upload

5. **Find your Device ID**:
   - Open Serial Monitor (115200 baud)
   - It will print something like: `Device ID: AA:BB:CC:DD:EE:FF`
   - Note this down

6. **Register in KhetBuddy app**:
   - Go to Paani (Water) page
   - Tap "Manage Sensors"
   - Tap "Add Sensor"
   - Enter your Device ID
   - Give it a name (e.g., "खेत A सेंसर")
   - Save

7. **Done!** The sensor will automatically send soil data every 30 minutes.
   Check the Paani page to see your readings.

---

## Calibration Notes

### Moisture Sensor
- Dip in water → note the reading (should be ~100%)
- Hold in air → note the reading (should be ~0%)
- Adjust the `map(raw, 3500, 1500, 0, 100)` values in firmware

### pH Sensor
- Use pH 7 buffer solution → note voltage at GPIO 35
- Use pH 4 buffer solution → note voltage
- Adjust the formula in `readpH()` function
- Recalibrate every 3-4 months

### NPK Sensor
- Readings are approximate (±5-10%)
- Best used for trend monitoring (increasing/decreasing)
- Verify with government Soil Health Card every 1-2 years
- Do NOT rely solely on sensor NPK for fertilizer dosing

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| WiFi won't connect | Check SSID/password, move closer to router |
| NPK reads -1 | Check RS485 wiring (A/B not swapped), ensure 12V connected |
| Moisture always 0 or 100 | Recalibrate — adjust map() values in firmware |
| pH reads wrong | Calibrate with buffer solutions, clean probe |
| "Unknown device" error | Register device_id in KhetBuddy app first |
| LED blinks fast (5x) | Error — check Serial Monitor for details |
| LED blinks slow (2x) | Success — data sent to KhetBuddy |
