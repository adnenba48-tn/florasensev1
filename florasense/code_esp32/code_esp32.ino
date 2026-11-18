
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHTesp.h>
#include <math.h>

// Wi-Fi Credentials
#define FLORASENSE_WIFI_SSID     "ADNEN"
#define FLORASENSE_WIFI_PASSWORD "BEN ABDALLAH "

#define FLORASENSE_API_URL "http://192.168.137.1:3000/api/ingest"

// Ingestion Secret Token (Must match INGESTION_TOKEN in backend/.env)
#define FLORASENSE_INGEST_TOKEN  "bbd280debe8531a11d545a19ed419163913cb72de52ae071d0d9acb002dbb212"

// ============================================================
// 3. PIN CONFIGURATION
// ============================================================

constexpr uint8_t PIN_DHT11      = 5;
constexpr uint8_t PIN_SOIL       = 34;
constexpr uint8_t PIN_LDR        = 27;

constexpr uint8_t PIN_LED_GREEN  = 23;
constexpr uint8_t PIN_LED_ORANGE = 19;
constexpr uint8_t PIN_LED_RED    = 26;

constexpr uint8_t PIN_LCD_SDA    = 21;
constexpr uint8_t PIN_LCD_SCL    = 22;

constexpr uint8_t LCD_ADDRESS = 0x27;
constexpr uint8_t LCD_COLS = 16;
constexpr uint8_t LCD_ROWS = 2;

// ============================================================
// 4. SYSTEM SETTINGS
// ============================================================

constexpr uint32_t TELEMETRY_INTERVAL = 5000;
constexpr uint32_t WIFI_RETRY_INTERVAL = 10000;
constexpr uint32_t HTTP_TIMEOUT = 5000;

constexpr uint8_t ADC_SAMPLES = 10;

// ESP32 ADC: 0 to 4095
constexpr int ADC_MAX_VALUE = 4095;

// ============================================================
// 5. PLANT HEALTH THRESHOLDS
// ============================================================

constexpr float TEMP_DANGER_LOW  = 10.0;
constexpr float TEMP_ALERT_HIGH  = 30.0;
constexpr float TEMP_DANGER_HIGH = 35.0;

constexpr float HUM_ALERT_LOW  = 30.0;
constexpr float HUM_ALERT_HIGH = 80.0;

constexpr int SOIL_ALERT_ADC  = 3800;
constexpr int SOIL_DANGER_ADC = 4000;

// ============================================================
// 6. PLANT STATES
// ============================================================

enum PlantState {
  STATE_NORMAL = 0,
  STATE_ALERT  = 1,
  STATE_DANGER = 2
};

// ============================================================
// 7. GLOBAL OBJECTS
// ============================================================

DHTesp dht;

LiquidCrystal_I2C lcd(
  LCD_ADDRESS,
  LCD_COLS,
  LCD_ROWS
);

uint32_t lastTelemetryMs = 0;
uint32_t lastWifiCheckMs = 0;

// ============================================================
// 8. HELPER FUNCTIONS
// ============================================================

int clampValue(int value, int minimum, int maximum) {
  return constrain(value, minimum, maximum);
}

int readAveragedADC(uint8_t pin) {
  uint32_t total = 0;

  for (uint8_t i = 0; i < ADC_SAMPLES; i++) {
    total += analogRead(pin);
    delayMicroseconds(250);
  }

  return total / ADC_SAMPLES;
}

int calculateSoilPercentage(int adcValue) {
  int percentage = (int)(
    ((ADC_MAX_VALUE - adcValue) / 4095.0) * 100.0
  );

  return clampValue(percentage, 0, 100);
}

// ============================================================
// 9. PLANT HEALTH EVALUATION
// ============================================================

PlantState evaluatePlantHealth(
  bool dhtValid,
  float temperature,
  float humidity,
  int soilADC
) {

  // Critical conditions
  if (
    !dhtValid ||
    temperature < TEMP_DANGER_LOW ||
    temperature >= TEMP_DANGER_HIGH ||
    soilADC >= SOIL_DANGER_ADC
  ) {
    return STATE_DANGER;
  }

  // Warning conditions
  if (
    temperature >= TEMP_ALERT_HIGH ||
    humidity < HUM_ALERT_LOW ||
    humidity > HUM_ALERT_HIGH ||
    soilADC >= SOIL_ALERT_ADC
  ) {
    return STATE_ALERT;
  }

  return STATE_NORMAL;
}

const char* getPlantStateName(PlantState state) {
  switch (state) {
    case STATE_NORMAL:
      return "NORMAL";

    case STATE_ALERT:
      return "ALERT";

    case STATE_DANGER:
      return "DANGER";

    default:
      return "UNKNOWN";
  }
}

// ============================================================
// 10. LED CONTROL
// ============================================================

void updateStatusLEDs(PlantState state) {

  digitalWrite(
    PIN_LED_GREEN,
    state == STATE_NORMAL ? HIGH : LOW
  );

  digitalWrite(
    PIN_LED_ORANGE,
    state == STATE_ALERT ? HIGH : LOW
  );

  digitalWrite(
    PIN_LED_RED,
    state == STATE_DANGER ? HIGH : LOW
  );
}

// ============================================================
// 11. LCD DISPLAY
// ============================================================

void printLCDLine(uint8_t row, const char* message) {

  lcd.setCursor(0, row);

  uint8_t count = 0;

  while (*message && count < LCD_COLS) {
    lcd.print(*message++);
    count++;
  }

  while (count < LCD_COLS) {
    lcd.print(' ');
    count++;
  }
}

void updateLCD(
  bool dhtValid,
  float temperature,
  float humidity,
  int soilADC,
  int lightValue,
  PlantState state
) {

  char line0[17];
  char line1[17];

  if (dhtValid) {
    snprintf(
      line0,
      sizeof(line0),
      "T:%4.1fC H:%2.0f%%",
      temperature,
      humidity
    );
  } else {
    snprintf(
      line0,
      sizeof(line0),
      "T:--.-C H:--%%"
    );
  }

  char statusChar =
    state == STATE_NORMAL ? 'N' :
    state == STATE_ALERT  ? 'A' : 'D';

  char lightChar = lightValue >= 2048 ? 'D' : 'L';

  int soilPercent = calculateSoilPercentage(soilADC);

  snprintf(
    line1,
    sizeof(line1),
    "S:%3d%% L:%c [%c]",
    soilPercent,
    lightChar,
    statusChar
  );

  printLCDLine(0, line0);
  printLCDLine(1, line1);
}

// ============================================================
// 12. WIFI CONNECTION
// ============================================================

void connectWiFi() {

  Serial.print("[FloraSense Wi-Fi] Connecting to: ");
  Serial.println(FLORASENSE_WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(
    FLORASENSE_WIFI_SSID,
    FLORASENSE_WIFI_PASSWORD
  );

  uint8_t attempts = 0;

  while (
    WiFi.status() != WL_CONNECTED &&
    attempts < 20
  ) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println("[Wi-Fi] Connected!");

    Serial.print("[Wi-Fi] ESP32 IP: ");
    Serial.println(WiFi.localIP());

  } else {

    Serial.println(
      "[Wi-Fi] Connection failed. Automatic retry enabled."
    );
  }
}

void maintainWiFiConnection() {

  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  uint32_t now = millis();

  if (now - lastWifiCheckMs >= WIFI_RETRY_INTERVAL) {

    lastWifiCheckMs = now;

    Serial.println("[Wi-Fi] Reconnecting...");

    WiFi.disconnect();
    WiFi.begin(
      FLORASENSE_WIFI_SSID,
      FLORASENSE_WIFI_PASSWORD
    );
  }
}

// ============================================================
// 13. BACKEND TELEMETRY
// ============================================================

bool transmitTelemetry(
  bool dhtValid,
  float temperature,
  float humidity,
  int soilADC,
  int lightValue,
  PlantState state
) {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("[HTTP] Wi-Fi offline. Transmission skipped.");

    return false;
  }

  HTTPClient http;

  if (!http.begin(FLORASENSE_API_URL)) {

    Serial.println("[HTTP] Invalid API URL.");

    return false;
  }

 http.setTimeout(HTTP_TIMEOUT);

http.addHeader("Content-Type", "application/json");
http.addHeader("X-Ingestion-Token", FLORASENSE_INGEST_TOKEN);

  // Build JSON payload
  char payload[200];

  if (dhtValid) {

    snprintf(
      payload,
      sizeof(payload),
      "{\"temp\":%.1f,\"hum\":%.1f,\"soil\":%d,\"light\":%d,\"state\":%d}",
      temperature,
      humidity,
      soilADC,
      lightValue,
      (int)state
    );

  } else {

    snprintf(
      payload,
      sizeof(payload),
      "{\"temp\":null,\"hum\":null,\"soil\":%d,\"light\":%d,\"state\":%d}",
      soilADC,
      lightValue,
      (int)state
    );
  }

  Serial.println("[HTTP] Sending telemetry...");
  Serial.println(payload);

  int httpCode = http.POST(payload);

  String response;

  if (httpCode > 0) {
    response = http.getString();
  } else {
    response = http.errorToString(httpCode);
  }

  http.end();

  if (
    httpCode == 200 ||
    httpCode == 201 ||
    httpCode == 202
  ) {

    Serial.printf(
      "[HTTP] SUCCESS - Code: %d\n",
      httpCode
    );

    Serial.println(response);

    return true;
  }

  if (httpCode == 401) {

    Serial.println(
      "[HTTP 401] Authentication failed. Check your token."
    );

  } else {

    Serial.printf(
      "[HTTP ERROR] Code: %d\n",
      httpCode
    );

    Serial.println(response);
  }

  return false;
}

// ============================================================
// 14. SENSOR READING
// ============================================================

void processSensorReadings() {

  // Read soil moisture sensor
  int soilADC = readAveragedADC(PIN_SOIL);

  soilADC = clampValue(
    soilADC,
    0,
    ADC_MAX_VALUE
  );

  // Read LDR digital output
  int ldrValue = digitalRead(PIN_LDR);

  // Assumption: HIGH = Dark, LOW = Light
  int lightValue =
    (ldrValue == HIGH) ? 4095 : 0;

  // Read DHT11
  TempAndHumidity climate =
    dht.getTempAndHumidity();

  bool dhtValid =
    !isnan(climate.temperature) &&
    !isnan(climate.humidity) &&
    climate.humidity >= 0 &&
    climate.humidity <= 100;

  // Evaluate plant health
  PlantState plantState = evaluatePlantHealth(
    dhtValid,
    climate.temperature,
    climate.humidity,
    soilADC
  );

  // Update physical indicators
  updateStatusLEDs(plantState);

  updateLCD(
    dhtValid,
    climate.temperature,
    climate.humidity,
    soilADC,
    lightValue,
    plantState
  );

  // Serial diagnostics
  Serial.println();
  Serial.println("======================================");
  Serial.println("       FLORASENSE SENSOR DATA");
  Serial.println("======================================");

  if (dhtValid) {

    Serial.printf(
      "Temperature: %.1f C\n",
      climate.temperature
    );

    Serial.printf(
      "Humidity: %.1f %%\n",
      climate.humidity
    );

  } else {

    Serial.println("DHT11: SENSOR ERROR");
  }

  Serial.printf(
    "Soil ADC: %d\n",
    soilADC
  );

  Serial.printf(
    "Soil Moisture: %d %%\n",
    calculateSoilPercentage(soilADC)
  );

  Serial.printf(
    "Light: %s\n",
    lightValue == 4095 ? "DARK" : "LIGHT"
  );

  Serial.printf(
    "Plant State: %s\n",
    getPlantStateName(plantState)
  );

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Wi-Fi: DISCONNECTED");
  }

  Serial.println("======================================");

  // Send real sensor readings to backend
  transmitTelemetry(
    dhtValid,
    climate.temperature,
    climate.humidity,
    soilADC,
    lightValue,
    plantState
  );
}

// ============================================================
// 15. SETUP
// ============================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  Serial.println();
  Serial.println("======================================");
  Serial.println(" FloraSense Smart Agriculture System");
  Serial.println(" ESP32 Initialization");
  Serial.println("======================================");

  // Configure pins
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_ORANGE, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);

  pinMode(PIN_SOIL, INPUT);
  pinMode(PIN_LDR, INPUT);

  // Initial LED state
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_ORANGE, HIGH);
  digitalWrite(PIN_LED_RED, LOW);

  // Configure ADC
  analogReadResolution(12);

  // Configure I2C LCD
  Wire.begin(
    PIN_LCD_SDA,
    PIN_LCD_SCL
  );

  lcd.begin(
    LCD_COLS,
    LCD_ROWS
  );

  lcd.setBacklight(HIGH);
  lcd.clear();

  printLCDLine(0, "FloraSense IoT");
  printLCDLine(1, "Initializing...");

  // Initialize DHT11
  dht.setup(
    PIN_DHT11,
    DHTesp::DHT11
  );

  // Connect Wi-Fi
  connectWiFi();

  if (WiFi.status() == WL_CONNECTED) {

    printLCDLine(0, "FloraSense Ready");
    printLCDLine(1, "Wi-Fi Connected");

  } else {

    printLCDLine(0, "FloraSense Ready");
    printLCDLine(1, "Wi-Fi Offline");
  }

  Serial.println("[FloraSense] Initialization complete.");

  // First telemetry cycle begins immediately
  lastTelemetryMs = millis() - TELEMETRY_INTERVAL;
}

// ============================================================
// 16. MAIN LOOP
// ============================================================

void loop() {

  maintainWiFiConnection();

  uint32_t now = millis();

  if (
    now - lastTelemetryMs >= TELEMETRY_INTERVAL
  ) {

    lastTelemetryMs = now;

    processSensorReadings();
  }

  delay(10);
}
