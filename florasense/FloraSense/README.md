# 🌿 FloraSense — Complete Premium IoT Smart Agriculture Platform

FloraSense is a commercial-grade, real-world IoT smart agriculture platform designed to monitor plant health in real time using physical ESP32 microcontrollers, climate and soil telemetry, Express.js backend, MongoDB Atlas storage, and a responsive web dashboard with multilingual support and Dark/Light modes.

---

## 1. System Architecture

```text
┌───────────────────────┐
│ Real Physical ESP32   │
│ - DHT11 (GPIO 5)      │
│ - Soil Sensor (GPIO 34)
│ - LDR Digital (GPIO 27)
│ - 3 Status LEDs       │
│ - 16x2 I2C LCD (0x27) │
└───────────┬───────────┘
            │ Wi-Fi HTTP POST (every 5s)
            ▼
┌────────────────────────────────────────┐
│ FloraSense Express Backend API         │
│ - Port: 3000                           │
│ - Endpoints:                           │
│   • GET  /health                       │
│   • POST /api/ingest (Bearer Token)    │
│   • GET  /api/data                     │
│   • GET  /api/data/history             │
└───────────┬────────────────────────────┘
            │
      ┌─────┴─────────────────────┐
      ▼                           ▼
┌───────────────┐       ┌────────────────────────┐
│ MongoDB Atlas │       │ FloraSense Web UI      │
│ SmartFarmDB   │       │ - Multilingual EN/FR/AR│
│ sensor_read   │       │ - Dark/Light mode      │
└───────────────┘       │ - Real-time charts     │
                        └────────────────────────┘
```

---

## 2. Project Directory Structure

```text
FloraSense/
├── assets/
│   ├── chart.umd.min.js          # Standalone Chart.js library
│   ├── esp32_board.svg           # High-resolution vector ESP32 board
│   ├── florasense_logo.png       # Official FloraSense circuit leaf logo
│   ├── florasense_logo_badge.png # FloraSense squircle badge
│   ├── hero_nature_wallpaper.jpg # Nature botanical wallpaper
│   └── nature_intelligence_sprout.jpg # Sprout seedling visual
├── backend/
│   ├── test/
│   │   └── server.test.js        # Comprehensive automated API test suite
│   ├── .env.example              # Environment variables template
│   ├── db.js                     # MongoDB connection & memory fallback buffer
│   ├── package.json              # Backend dependencies
│   ├── server.js                 # Express server & telemetry endpoints
│   └── validation.js             # ESP32 sensor payload validator
├── firmware/
│   ├── config.h                  # Private ESP32 configuration (Wi-Fi, URL, Token)
│   ├── config.example.h          # Configuration template
│   └── FloraSense.ino            # Complete Arduino IDE ESP32 sketch
├── frontend/
│   ├── css/
│   │   └── style.css             # Glassmorphic, modern CSS & RTL support
│   ├── js/
│   │   └── app.js                # Frontend telemetry client, i18n & charts
│   └── index.html                # Responsive web app
├── .env.example                  # Root environment template
├── .gitignore                    # Protects secrets & node_modules
├── package.json                  # Root runner script
└── README.md                     # Platform documentation
```

---

## 3. Quickstart: Running the Web Platform

### Prerequisites
- Node.js (v18.0 or higher)
- NPM

### Step 1: Install Dependencies
Open PowerShell or your terminal and navigate to the project directory:

```powershell
cd C:\Users\adnen\Desktop\FloraSense\backend
npm install
```

### Step 2: Configure Environment (.env)
Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

*(Note: The server is designed to start and run immediately in buffered mode even before you add MongoDB Atlas credentials!)*

### Step 3: Run Automated API Tests
Verify all API endpoints and validation rules:

```powershell
npm test
```

### Step 4: Start the Backend Server
```powershell
npm start
```

Output:
```text
====================================================
🌿 FloraSense IoT Platform Server v2.0.0
🚀 API listening on: http://0.0.0.0:3000
📡 Ingestion endpoint: http://0.0.0.0:3000/api/ingest
📊 Health check: http://0.0.0.0:3000/health
====================================================
```

### Step 5: Open the Web Dashboard
Open your browser and navigate to:
**`http://localhost:3000`**

*(You can also open `frontend/index.html` directly in any web browser!)*

---

## 4. Hardware Wiring & Pin Assignments

| Component | ESP32 GPIO Pin | Description |
| :--- | :--- | :--- |
| **DHT11 Data** | **GPIO 5** | Temperature & Humidity Sensor |
| **Soil Moisture (AO)** | **GPIO 34** | Analog Out (0 - 4095 ADC) |
| **LDR Sensor (DO)** | **GPIO 27** | Digital Out (0 = Light, 4095 = Dark) |
| **Green LED** | **GPIO 23** | Optimal Plant Condition Indicator |
| **Orange / Yellow LED** | **GPIO 19** | Alert Indicator |
| **Red LED** | **GPIO 26** | Danger Indicator |
| **LCD 16x2 SDA** | **GPIO 21** | I2C Data (Address `0x27`) |
| **LCD 16x2 SCL** | **GPIO 22** | I2C Clock (Address `0x27`) |

---

## 5. Configuring & Flashing the ESP32 Firmware

### Arduino IDE Setup
1. Open **Arduino IDE**.
2. Go to **File → Open** and select:
   `C:\Users\adnen\Desktop\FloraSense\firmware\FloraSense.ino`
3. Install required libraries via **Sketch → Include Library → Manage Libraries**:
   - `DHT sensor library for ESPx` by beegee_tokyo (or `DHTesp`)
   - `LiquidCrystal I2C` by Frank de Brabander
4. Under **Tools → Board**, select: **ESP32 Dev Module**.
5. Under **Tools → Port**, select your ESP32 COM port.

### Firmware Configuration
Open `firmware/config.h` in Arduino IDE or a text editor:

```cpp
// 1. Your Wi-Fi network (Must be 2.4 GHz)
#define FLORASENSE_WIFI_SSID     "Your_WiFi_Name"
#define FLORASENSE_WIFI_PASSWORD "Your_WiFi_Password"

// 2. Your Computer's Local LAN IP (Run 'ipconfig' in PowerShell to find it)
#define FLORASENSE_API_URL       "http://192.168.1.109:3000/api/ingest"

// 3. Ingestion Token (Must match INGESTION_TOKEN in backend/.env)
#define FLORASENSE_INGEST_TOKEN  "FloraSense_Secure_Token_Change_Me_In_Production"
```

> **IMPORTANT TIP FOR LOCAL TESTING:**
> An ESP32 cannot connect to `http://localhost:3000` or `http://127.0.0.1:3000` because localhost points to the ESP32 itself. Always use your computer's local Wi-Fi IP address (e.g. `http://192.168.1.XXX:3000/api/ingest`).
> Ensure your Windows Firewall allows inbound connections on TCP port 3000 on Private networks.

6. Click **Upload** (Arrow icon).
7. Open **Serial Monitor** at **115200 baud** to see real-time diagnostics and transmission confirmations.

---

## 6. Connecting MongoDB Atlas Later

FloraSense does not require MongoDB during initial boot—it gracefully runs in memory-buffered mode. When you are ready to connect MongoDB Atlas:

1. Log into your [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.
2. Under **Database Access**, create a database user (e.g., `florasense_admin`).
3. Under **Network Access**, ensure your current IP address (or `0.0.0.0/0` for cloud deployment) is allowed.
4. Click **Connect → Drivers → Node.js** to copy your connection string:
   ```text
   mongodb+srv://florasense_admin:<password>@cluster0.mongodb.net/SmartFarmDB?retryWrites=true&w=majority
   ```
5. Open `backend/.env` and paste your URI:
   ```ini
   MONGODB_URI=mongodb+srv://florasense_admin:YourSecretPassword@cluster0.mongodb.net/SmartFarmDB?retryWrites=true&w=majority
   ```
6. Restart the backend server (`npm start`). FloraSense will automatically detect the database and persist all readings to `SmartFarmDB.sensor_readings`.

---

## 7. Features & Capabilities

- **Zero Fake Data:** Clearly displays offline/disconnected states when the hardware is not actively transmitting. Never fabricates sensor readings.
- **Dark Mode & Light Mode:** Accessible color-scheme architecture adhering to modern web standards, with persistent localStorage preference and anti-FOUC prevention.
- **Multilingual (EN / FR / AR):** Dynamic translation across English, French, and Arabic with true CSS logical properties and Right-to-Left (RTL) mirroring.
- **Historical Telemetry Charts:** Interactive Chart.js timeline with temperature, humidity, and soil moisture tracking.
- **CSV Data Export:** One-click export of sensor records for analytical reports.
- **Plant Diagnostic Engine:** Real-time health classification (`OPTIMAL`, `ALERT`, `DANGER`) based on calibrated botanical thresholds.
