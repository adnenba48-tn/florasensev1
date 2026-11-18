/**
 * ============================================================================
 * FloraSense - Smart Agriculture IoT Platform
 * ESP32 Production Firmware for Arduino IDE
 * ============================================================================
 * 
 * Hardware Configuration:
 * - ESP32 Dev Module
 * - DHT11 Data: GPIO 5
 * - Soil Moisture AO: GPIO 34 (Analog In, 12-bit ADC)
 * - LDR Digital Out (DO): GPIO 27
 * - Green Status LED: GPIO 23
 * - Orange / Yellow Status LED: GPIO 19
 * - Red Status LED: GPIO 26
 * - LCD 16x2 I2C: SDA GPIO 21, SCL GPIO 22 (Address: 0x27)
 * 
 * Communication:
 * - Connects to local 2.4GHz Wi-Fi
 * - Transmits JSON sensor telemetry to FloraSense Backend API every 5 seconds
 * - Uses Bearer and X-Ingestion-Token authentication
 * ============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHTesp.h>


#pragma once

/**
 * FloraSense ESP32 Firmware Configuration
 * Set your local Wi-Fi and FloraSense API settings below.
 */

// Wi-Fi Credentials
#define FLORASENSE_WIFI_SSID     "ABA 1281"
#define FLORASENSE_WIFI_PASSWORD "ABA25538"

// FloraSense Backend Ingestion URL
// Note: ESP32 cannot reach 'localhost' or '127.0.0.1' - use your computer's local LAN IP (e.g., 192.168.1.X)
#define FLORASENSE_API_URL "http://192.168.100.7:3000/api/ingest"

// Ingestion Secret Token (Must match INGESTION_TOKEN in backend/.env)
#define FLORASENSE_INGEST_TOKEN  "bbd280debe8531a11d545a19ed419163913cb72de52ae071d0d9acb002dbb212"

// ----------------------------------------------------------------------------
// Pin Definitions
// ----------------------------------------------------------------------------
constexpr uint8_t PIN_DHT11       = 5;
constexpr uint8_t PIN_SOIL_AO     = 34;
constexpr uint8_t PIN_LDR_DO      = 27;
constexpr uint8_t PIN_LED_GREEN   = 23;
constexpr uint8_t PIN_LED_ORANGE  = 19;
constexpr uint8_t PIN_LED_RED     = 26;
constexpr uint8_t PIN_LCD_SDA     = 21;
constexpr uint8_t PIN_LCD_SCL     = 22;

constexpr uint8_t LCD_I2C_ADDR    = 0x27;
constexpr uint8_t LCD_COLS        = 16;
constexpr uint8_t LCD_ROWS        = 2;

// ----------------------------------------------------------------------------
// Thresholds & Constants
// ----------------------------------------------------------------------------
constexpr uint32_t TELEMETRY_INTERVAL_MS = 5000; // Transmit every 5 seconds
constexpr uint8_t  ANALOG_SAMPLE_COUNT   = 10;

// Plant Condition States
enum PlantState {
  STATE_NORMAL = 0,
  STATE_ALERT  = 1,
  STATE_DANGER = 2
};

// Thresholds for Plant Health
constexpr float TEMP_DANGER_LOW   = 10.0f;
constexpr float TEMP_ALERT_HIGH   = 30.0f;
constexpr float TEMP_DANGER_HIGH  = 35.0f;
constexpr float HUM_ALERT_LOW     = 30.0f;
constexpr float HUM_ALERT_HIGH    = 80.0f;
constexpr int   SOIL_ALERT_ADC    = 3800; // Dry threshold
constexpr int   SOIL_DANGER_ADC   = 4000; // Extreme dry threshold

// ----------------------------------------------------------------------------
// Global Peripherals
// ----------------------------------------------------------------------------
DHTesp dht;
LiquidCrystal_I2C lcd(LCD_I2C_ADDR, LCD_COLS, LCD_ROWS);

uint32_t lastTelemetryMs = 0;
uint32_t lastWifiCheckMs = 0;

// ----------------------------------------------------------------------------
// Helper: Average Analog Reading
// ----------------------------------------------------------------------------
int readAveragedAdc(uint8_t pin, uint8_t samples) {
  uint32_t sum = 0;
  for (uint8_t i = 0; i < samples; ++i) {
    sum += analogRead(pin);
    delayMicroseconds(250);
  }
  return static_cast<int>(sum / samples);
}

// ----------------------------------------------------------------------------
// Plant Health Evaluation Logic
// ----------------------------------------------------------------------------
PlantState evaluatePlantHealth(bool dhtValid, float temp, float hum, int soilAdc) {
  if (!dhtValid || temp < TEMP_DANGER_LOW || temp >= TEMP_DANGER_HIGH || soilAdc >= SOIL_DANGER_ADC) {
    return STATE_DANGER;
  }
  if (temp >= TEMP_ALERT_HIGH || hum < HUM_ALERT_LOW || hum > HUM_ALERT_HIGH || soilAdc >= SOIL_ALERT_ADC) {
    return STATE_ALERT;
  }
  return STATE_NORMAL;
}

const char* getPlantStateName(PlantState state) {
  switch (state) {
    case STATE_NORMAL: return "NORMAL";
    case STATE_ALERT:  return "ALERT";
    case STATE_DANGER: return "DANGER";
    default:           return "UNKNOWN";
  }
}

// ----------------------------------------------------------------------------
// Hardware Control Functions
// ----------------------------------------------------------------------------
void updateStatusLeds(PlantState state) {
  digitalWrite(PIN_LED_GREEN,  state == STATE_NORMAL ? HIGH : LOW);
  digitalWrite(PIN_LED_ORANGE, state == STATE_ALERT  ? HIGH : LOW);
  digitalWrite(PIN_LED_RED,    state == STATE_DANGER ? HIGH : LOW);
}

void printLcdLine(uint8_t row, const char* str) {
  lcd.setCursor(0, row);
  uint8_t count = 0;
  while (*str && count < LCD_COLS) {
    lcd.print(*str++);
    count++;
  }
  while (count < LCD_COLS) {
    lcd.print(' ');
    count++;
  }
}

void updateLcdDisplay(bool dhtValid, float temp, float hum, int soilAdc, int lightLevel, PlantState state) {
  char line0[17];
  char line1[17];

  // Line 0: Temperature and Humidity
  if (dhtValid) {
    snprintf(line0, sizeof(line0), "T:%4.1fC H:%2.0f%%", temp, hum);
  } else {
    snprintf(line0, sizeof(line0), "T:--.-C  H:--%%");
  }

  // Line 1: Soil ADC, Light (D=Dark / L=Light), and Status (N/A/D)
  const char statusChar = (state == STATE_NORMAL) ? 'N' : (state == STATE_ALERT ? 'A' : 'D');
  const char lightChar  = (lightLevel >= 2048 || lightLevel == 1) ? 'D' : 'L';
  const int soilPercent = max(0, min(100, (int)(((4095 - soilAdc) / 4095.0) * 100)));

  snprintf(line1, sizeof(line1), "S:%3d%% L:%c [%c]", soilPercent, lightChar, statusChar);

  printLcdLine(0, line0);
  printLcdLine(1, line1);
}

// ----------------------------------------------------------------------------
// Wi-Fi Connection Manager
// ----------------------------------------------------------------------------
void connectWifi() {
  Serial.println(F("[FloraSense Wi-Fi] Connecting to Wi-Fi SSID: ") + String(FLORASENSE_WIFI_SSID));
  WiFi.mode(WIFI_STA);
  WiFi.begin(FLORASENSE_WIFI_SSID, FLORASENSE_WIFI_PASSWORD);

  uint8_t attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print('.');
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("[FloraSense Wi-Fi] Connected!"));
    Serial.print(F("[FloraSense Wi-Fi] Assigned IP: "));
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(F("[FloraSense Wi-Fi] Connection timeout. Will retry automatically."));
  }
}

// ----------------------------------------------------------------------------
// HTTP Telemetry Transmission
// ----------------------------------------------------------------------------
bool transmitTelemetry(bool dhtValid, float temp, float hum, int soilAdc, int lightLevel, PlantState state) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[FloraSense HTTP] Cannot transmit: Wi-Fi offline"));
    return false;
  }

  HTTPClient http;
  if (!http.begin(FLORASENSE_API_URL)) {
    Serial.println(F("[FloraSense HTTP] Invalid API URL: ") + String(FLORASENSE_API_URL));
    return false;
  }

  http.setTimeout(4000);
  http.addHeader(F("Content-Type"), F("application/json"));
  http.addHeader(F("Authorization"), String(F("Bearer ")) + FLORASENSE_INGEST_TOKEN);
  http.addHeader(F("X-Ingestion-Token"), FLORASENSE_INGEST_TOKEN);

  // Build JSON payload
  char payload[180];
  if (dhtValid) {
    snprintf(payload, sizeof(payload),
      "{\"temp\":%.1f,\"hum\":%.1f,\"soil\":%d,\"light\":%d,\"state\":%d}",
      temp, hum, soilAdc, lightLevel, static_cast<int>(state));
  } else {
    snprintf(payload, sizeof(payload),
      "{\"temp\":null,\"hum\":null,\"soil\":%d,\"light\":%d,\"state\":%d}",
      soilAdc, lightLevel, static_cast<int>(state));
  }

  Serial.printf("[FloraSense HTTP] POST %s -> %s\n", FLORASENSE_API_URL, payload);

  const int httpCode = http.POST(payload);
  const String response = (httpCode > 0) ? http.getString() : http.errorToString(httpCode);
  http.end();

  if (httpCode == 202 || httpCode == 200 || httpCode == 201) {
    Serial.printf("[FloraSense HTTP] Success (HTTP %d)\n", httpCode);
    return true;
  } else if (httpCode == 401) {
    Serial.println(F("[FloraSense HTTP ERROR 401] Unauthorized! Check FLORASENSE_INGEST_TOKEN matches backend .env"));
  } else {
    Serial.printf("[FloraSense HTTP ERROR] Code: %d, Response: %s\n", httpCode, response.c_str());
  }

  return false;
}

// ----------------------------------------------------------------------------
// Setup
// ----------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println(F("\n=================================================="));
  Serial.println(F("🌿 FloraSense Smart Plant Monitoring System"));
  Serial.println(F("ESP32 Dev Module Hardware Initialization"));
  Serial.println(F("=================================================="));

  // Configure GPIOs
  pinMode(PIN_LED_GREEN,  OUTPUT);
  pinMode(PIN_LED_ORANGE, OUTPUT);
  pinMode(PIN_LED_RED,    OUTPUT);
  pinMode(PIN_SOIL_AO,    INPUT);
  pinMode(PIN_LDR_DO,     INPUT);

  // Initial LED State: Warning until self-test completes
  digitalWrite(PIN_LED_GREEN,  LOW);
  digitalWrite(PIN_LED_ORANGE, HIGH);
  digitalWrite(PIN_LED_RED,    LOW);

  // Set 12-bit ADC resolution (0 - 4095)
  analogReadResolution(12);

  // Initialize I2C and LCD
  Wire.begin(PIN_LCD_SDA, PIN_LCD_SCL);
  lcd.begin(LCD_COLS, LCD_ROWS);
  lcd.setBacklight(HIGH);
  lcd.clear();
  printLcdLine(0, "FloraSense IoT");
  printLcdLine(1, "Initializing...");

  // Initialize DHT11 sensor
  dht.setup(PIN_DHT11, DHTesp::DHT11);

  // Connect to Wi-Fi
  connectWifi();

  printLcdLine(0, "FloraSense Ready");
  printLcdLine(1, WiFi.status() == WL_CONNECTED ? "Wi-Fi: Connected" : "Wi-Fi: Offline");

  Serial.println(F("[FloraSense] Setup complete. Entering operational loop..."));
}

// ----------------------------------------------------------------------------
// Main Loop
// ----------------------------------------------------------------------------
void loop() {
  const uint32_t now = millis();

  // Automatic Wi-Fi Reconnect Watchdog (every 10s if disconnected)
  if (WiFi.status() != WL_CONNECTED && (now - lastWifiCheckMs >= 10000)) {
    lastWifiCheckMs = now;
    Serial.println(F("[FloraSense Wi-Fi] Disconnected, attempting reconnect..."));
    WiFi.reconnect();
  }

  // Periodic Sensor Read & Telemetry Transmission (every 5s)
  if (now - lastTelemetryMs >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMs = now;

    // 1. Read Soil Moisture (Analog ADC average)
    const int soilAdc = readAveragedAdc(PIN_SOIL_AO, ANALOG_SAMPLE_COUNT);

    // 2. Read Digital LDR Light Sensor (DO)
    const int ldrVal = digitalRead(PIN_LDR_DO);
    const int lightAdc = (ldrVal == HIGH) ? 4095 : 0; // 4095 = Dark, 0 = Light

    // 3. Read DHT11 Temperature & Humidity
    const TempAndHumidity climate = dht.getTempAndHumidity();
    const bool dhtOk = !isnan(climate.temperature) && !isnan(climate.humidity);

    // 4. Evaluate Plant Health
    const PlantState plantState = evaluatePlantHealth(dhtOk, climate.temperature, climate.humidity, soilAdc);

    // 5. Update Status LEDs
    updateStatusLeds(plantState);

    // 6. Update LCD 16x2
    updateLcdDisplay(dhtOk, climate.temperature, climate.humidity, soilAdc, lightAdc, plantState);

    // 7. Print Diagnostics to Serial Monitor
    Serial.println(F("---------------------------------------------"));
    if (dhtOk) {
      Serial.printf("Temp: %.1f C | Hum: %.1f %%\n", climate.temperature, climate.humidity);
    } else {
      Serial.println(F("Temp/Hum: [DHT11 Error] Sensor unavailable"));
    }
    Serial.printf("Soil ADC: %d (Moisture: %d %%)\n", soilAdc, max(0, min(100, (int)(((4095 - soilAdc) / 4095.0) * 100))));
    Serial.printf("Light Sensor: %s (Raw: %d)\n", (lightAdc == 4095 ? "DARK" : "LIGHT"), lightAdc);
    Serial.printf("Plant Condition: [%s]\n", getPlantStateName(plantState));
    Serial.printf("Wi-Fi IP: %s\n", WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString().c_str() : "Disconnected");

    // 8. Send Telemetry to Backend
    transmitTelemetry(dhtOk, climate.temperature, climate.humidity, soilAdc, lightAdc, plantState);
  }
}
