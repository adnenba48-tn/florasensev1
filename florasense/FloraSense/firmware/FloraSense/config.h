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
#define FLORASENSE_API_URL "http://192.168.137.1:3000/api/ingest"

 Copier// Ingestion Secret Token (Must match INGESTION_TOKEN in backend/.env)
#define FLORASENSE_INGEST_TOKEN  "bbd280debe8531a11d545a19ed419163913cb72de52ae071d0d9acb002dbb212"
