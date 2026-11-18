/**
 * FloraSense IoT Platform - Backend Integration Test Suite
 */

const assert = require('node:assert/strict');
const { test, describe, before, after } = require('node:test');
const http = require('node:http');

// Set test env
process.env.PORT = '0'; // ephemeral port
process.env.INGESTION_TOKEN = 'test-secret-token-12345';
process.env.MONGODB_URI = ''; // test in memory-buffered mode

const { createApp } = require('../server');

let server;
let baseUrl;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('FloraSense Backend API Tests', () => {
  test('GET /health returns healthy system status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.platform, 'FloraSense IoT Platform');
    assert.ok(data.database);
    assert.ok(data.esp32);
    assert.equal(typeof data.uptime_seconds, 'number');
  });

  test('POST /api/ingest rejects unauthorized requests without token', async () => {
    const res = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temp: 24.5, hum: 60, soil: 2000, light: 0, state: 0 })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.ok(data.error.includes('Unauthorized'));
  });

  test('POST /api/ingest rejects unauthorized requests with wrong token', async () => {
    const res = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer wrong-token'
      },
      body: JSON.stringify({ temp: 24.5, hum: 60, soil: 2000, light: 0, state: 0 })
    });
    assert.equal(res.status, 401);
  });

  test('POST /api/ingest rejects invalid payload structure', async () => {
    const res = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-secret-token-12345'
      },
      body: JSON.stringify({ temp: 'hot', hum: 999, soil: -5 })
    });
    assert.equal(res.status, 400);
  });

  test('POST /api/ingest accepts valid telemetry with Bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-secret-token-12345'
      },
      body: JSON.stringify({
        temp: 25.3,
        hum: 66.0,
        soil: 2800,
        light: 4095,
        state: 0
      })
    });
    assert.equal(res.status, 202);
    const data = await res.json();
    assert.equal(data.accepted, true);
    assert.equal(data.reading.temp, 25.3);
    assert.equal(data.reading.hum, 66.0);
    assert.equal(data.reading.light_condition, 'DARK');
    assert.equal(data.reading.state_name, 'NORMAL');
  });

  test('POST /api/ingest accepts valid telemetry with X-Ingestion-Token header', async () => {
    const res = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ingestion-Token': 'test-secret-token-12345'
      },
      body: JSON.stringify({
        temp: null,
        hum: null,
        soil: 4000,
        light: 0,
        state: 2
      })
    });
    assert.equal(res.status, 202);
    const data = await res.json();
    assert.equal(data.accepted, true);
    assert.equal(data.reading.temp, null);
    assert.equal(data.reading.hum, null);
    assert.equal(data.reading.state_name, 'DANGER');
  });

  test('GET /api/data returns latest ingested reading and ESP32 status', async () => {
    const res = await fetch(`${baseUrl}/api/data`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.soil, 4000);
    assert.equal(data.state_name, 'DANGER');
    assert.ok(data.esp32);
    assert.equal(data.esp32.connected, true);
  });

  test('GET /api/data/history returns array of readings', async () => {
    const res = await fetch(`${baseUrl}/api/data/history?limit=10`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.readings));
    assert.ok(data.readings.length >= 2);
  });

  test('GET /api/data/history rejects invalid limit', async () => {
    const res = await fetch(`${baseUrl}/api/data/history?limit=invalid`);
    assert.equal(res.status, 400);
  });
});
