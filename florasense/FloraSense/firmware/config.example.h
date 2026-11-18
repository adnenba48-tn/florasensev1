#pragma once

/**
 * FloraSense ESP32 Firmware Configuration Template
 * Rename or copy this file to 'config.h' and fill in your network credentials.
 * DO NOT commit 'config.h' to public version control.
 */

// Wi-Fi Credentials
#define FLORASENSE_WIFI_SSID     "YOUR_WIFI_SSID"
#define FLORASENSE_WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// FloraSense Backend Ingestion URL
// For local LAN: http://<YOUR_COMPUTER_LOCAL_IP>:3000/api/ingest (e.g., http://192.168.1.109:3000/api/ingest)
// For Cloud/Render: https://your-domain.com/api/ingest
#define FLORASENSE_API_URL       "http://192.168.1.100:3000/api/ingest"

// Ingestion Secret Token (Must match INGESTION_TOKEN in backend .env)
#define FLORASENSE_INGEST_TOKEN  "FloraSense_Secure_Token_Change_Me_In_Production"
