/**
 * FloraSense IoT Platform - Express Backend API Server
 * Real-time Smart Agriculture Telemetry Server
 */

const path = require('node:path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createHash, timingSafeEqual } = require('node:crypto');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });
// Also fall back to parent .env if present
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { initDb, getDbStatus, saveReading, getLatestReading, getHistory } = require('./db');
const { validateReading } = require('./validation');

// Configuration
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const INGESTION_TOKEN = process.env.INGESTION_TOKEN || 'FloraSense_Default_Secure_Ingest_Token_2026';
const MONGODB_URI = process.env.MONGODB_URI || '';

// ESP32 Connection Tracker
let lastEsp32PingMs = 0;
let lastEsp32Ip = null;
const ESP32_OFFLINE_THRESHOLD_MS = 15000; // 15 seconds (ESP32 transmits every 5s)

function getEsp32Status() {
  const isOnline = (Date.now() - lastEsp32PingMs) < ESP32_OFFLINE_THRESHOLD_MS;
  return {
    connected: isOnline,
    last_seen: lastEsp32PingMs > 0 ? new Date(lastEsp32PingMs).toISOString() : null,
    ip: lastEsp32Ip || 'Awaiting Connection',
    status: isOnline ? 'online' : (lastEsp32PingMs === 0 ? 'awaiting_first_contact' : 'offline')
  };
}

/**
 * Timing-safe token authentication middleware.
 * Accepts token via 'Authorization: Bearer <token>' or 'X-Ingestion-Token: <token>'.
 */
function authenticateIngestion(expectedToken) {
  const cleanExpected = (expectedToken || '').trim().replace(/^["']|["']$/g, '');
  const expectedHash = createHash('sha256').update(cleanExpected).digest();

  return (req, res, next) => {
    let providedToken = '';
    const authHeader = req.get('authorization') || '';
    const match = /^Bearer\s+(\S+)$/i.exec(authHeader);

    if (match) {
      providedToken = match[1];
    } else if (req.get('x-ingestion-token')) {
      providedToken = req.get('x-ingestion-token');
    }

    const cleanProvided = (providedToken || '').trim().replace(/^["']|["']$/g, '');
    if (!cleanProvided) {
      return res.status(401).json({
        error: 'Unauthorized. Missing ingestion token.',
        hint: 'Provide token via Authorization: Bearer <token> or X-Ingestion-Token header.'
      });
    }

    const providedHash = createHash('sha256').update(cleanProvided).digest();

    if (!timingSafeEqual(expectedHash, providedHash)) {
      console.warn(`[FloraSense Auth] Ingestion attempt with invalid token from ${req.ip}`);
      return res.status(401).json({
        error: 'Unauthorized. Invalid ingestion token.'
      });
    }

    return next();
  };
}

function createApp() {
  const app = express();

  // CORS support
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Ingestion-Token']
  }));

  // JSON Body Parser with 16kb limit
  app.use(express.json({ limit: '16kb' }));

  // Static files: serve assets and frontend
  const assetsPath = path.join(__dirname, '..', 'assets');
  const frontendPath = path.join(__dirname, '..', 'frontend');
  app.use('/assets', express.static(assetsPath));
  app.use(express.static(frontendPath));

  // 1. Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      platform: 'FloraSense IoT Platform',
      version: '2.0.0',
      uptime_seconds: Math.round(process.uptime()),
      database: getDbStatus(),
      esp32: getEsp32Status()
    });
  });

  // 2. Ingest telemetry from ESP32
  app.post('/api/ingest', authenticateIngestion(INGESTION_TOKEN), async (req, res) => {
    const reading = validateReading(req.body);

    if (!reading) {
      return res.status(400).json({
        error: 'Invalid sensor reading payload.',
        expected: {
          temp: 'number (-40 to 80 °C) or null',
          hum: 'number (0 to 100 %) or null',
          soil: 'integer (0 to 4095 ADC)',
          light: 'integer (0 or 4095)',
          state: '0 (NORMAL), 1 (ALERT), or 2 (DANGER)'
        }
      });
    }

    // Update ESP32 activity tracking
    lastEsp32PingMs = Date.now();
    lastEsp32Ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    try {
      const saved = await saveReading(reading);
      return res.status(202).json({
        accepted: true,
        message: 'Telemetry reading successfully recorded.',
        reading: saved
      });
    } catch (err) {
      console.error('[FloraSense API] Failed to record telemetry:', err);
      return res.status(500).json({ error: 'Internal server error saving telemetry.' });
    }
  });

  // 3. Get latest sensor reading
  app.get('/api/data', async (req, res) => {
    try {
      const latest = await getLatestReading();
      const esp32Status = getEsp32Status();
      const dbStatus = getDbStatus();

      if (!latest) {
        return res.status(404).json({
          error: 'No sensor readings available yet.',
          esp32: esp32Status,
          database: dbStatus
        });
      }

      return res.json({
        ...latest,
        esp32: esp32Status,
        database: dbStatus
      });
    } catch (err) {
      console.error('[FloraSense API] Error getting latest reading:', err);
      return res.status(500).json({ error: 'Failed to retrieve latest sensor reading.' });
    }
  });

  // 4. Get historical telemetry readings
  app.get('/api/data/history', async (req, res) => {
    let limit = 100;
    if (req.query.limit !== undefined) {
      limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 2000) {
        return res.status(400).json({ error: 'Query parameter limit must be an integer between 1 and 2000.' });
      }
    }

    try {
      const readings = await getHistory(limit);
      return res.json({
        count: readings.length,
        limit,
        readings,
        esp32: getEsp32Status(),
        database: getDbStatus()
      });
    } catch (err) {
      console.error('[FloraSense API] Error getting history:', err);
      return res.status(500).json({ error: 'Failed to retrieve telemetry history.' });
    }
  });

  // Fallback route for SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Request body contains invalid JSON.' });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request payload exceeds 16KB limit.' });
    }
    console.error('[FloraSense Server Error]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}

// Start Server when invoked directly
if (require.main === module) {
  const app = createApp();

  // Initialize DB asynchronously without blocking server start
  initDb(MONGODB_URI).then(() => {
    app.listen(PORT, HOST, () => {
      console.log('====================================================');
      console.log(`🌿 FloraSense IoT Platform Server v2.0.0`);
      console.log(`🚀 API listening on: http://${HOST}:${PORT}`);
      console.log(`📡 Ingestion endpoint: http://${HOST}:${PORT}/api/ingest`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
      console.log('====================================================');
    });
  });
}

module.exports = { createApp, getEsp32Status };
