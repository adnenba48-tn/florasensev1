/**
 * FloraSense IoT Platform - Input Validation Module
 * Validates and normalizes ESP32 telemetry payloads.
 */

function isFiniteNumber(val) {
  return typeof val === 'number' && Number.isFinite(val);
}

function normalizeState(state) {
  if (state === 0 || state === '0' || state === 'NORMAL' || state === 'normal') {
    return { code: 0, name: 'NORMAL' };
  }
  if (state === 1 || state === '1' || state === 'ALERT' || state === 'alert' || state === 'ALERTE') {
    return { code: 1, name: 'ALERT' };
  }
  if (state === 2 || state === '2' || state === 'DANGER' || state === 'danger') {
    return { code: 2, name: 'DANGER' };
  }
  return null;
}

/**
 * Validates sensor payload from ESP32.
 * @param {object} body - Request body
 * @returns {object|null} Sanitized reading object or null if invalid
 */
function validateReading(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  const { temp, hum, soil, light, state } = body;

  // Temperature and Humidity: either valid numbers or both null (DHT11 sensor error)
  const climateValid =
    (temp === null && hum === null) ||
    (isFiniteNumber(temp) && temp >= -40 && temp <= 80 &&
     isFiniteNumber(hum) && hum >= 0 && hum <= 100);

  if (!climateValid) {
    return null;
  }

  // Soil ADC: 0 to 4095 (ESP32 12-bit ADC)
  if (!Number.isInteger(soil) || soil < 0 || soil > 4095) {
    return null;
  }

  // Light: 0 to 4095 (or 0/1 digital)
  if (!Number.isInteger(light) || light < 0 || light > 4095) {
    return null;
  }

  // State: 0, 1, 2 or string
  const stateObj = normalizeState(state);
  if (!stateObj) {
    return null;
  }

  // Convert raw soil ADC (0-4095) to percentage (4095 is dry, 0 is fully saturated)
  // Moisture % = (4095 - soil) / 4095 * 100
  const soilPercent = Math.round(Math.max(0, Math.min(100, ((4095 - soil) / 4095) * 100)));

  // Digital LDR: 4095 or 1 means DARK (pullup/sensor trigger), 0 means LIGHT
  const lightCondition = (light >= 2048 || light === 1) ? 'DARK' : 'LIGHT';

  return {
    temp: temp !== null ? Math.round(temp * 10) / 10 : null,
    hum: hum !== null ? Math.round(hum * 10) / 10 : null,
    soil,
    soil_percent: soilPercent,
    light,
    light_condition: lightCondition,
    state: stateObj.code,
    state_name: stateObj.name,
    timestamp: new Date()
  };
}

module.exports = {
  validateReading,
  normalizeState,
  isFiniteNumber
};
