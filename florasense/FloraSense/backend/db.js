
/**
 * FloraSense IoT Platform - Database Integration Module
 * MongoDB connection and data operations.
 */

const { MongoClient } = require('mongodb');

let client = null;
let db = null;
let collection = null;

let connectionStatus = 'not_configured';
let lastError = null;

const DATABASE_NAME = 'FLORASENSORS';
const COLLECTION_NAME = 'sensor_readings';

const memoryHistory = [];
const MAX_MEMORY_HISTORY = 1000;
let latestMemoryReading = null;

function sanitizeMongoError(error, uri = '') {
  let message = String(error?.message || error);

  if (uri) {
    message = message.split(uri).join('[MongoDB URI Redacted]');
  }

  return message.replace(
    /mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi,
    '[MongoDB URI Redacted]'
  );
}

async function initDb(mongoUri) {
  if (!mongoUri || !mongoUri.trim() ||
      mongoUri.includes('YOUR_MONGODB')) {
    connectionStatus = 'not_configured';
    lastError = 'MongoDB URI is not configured in .env.';
    console.log('[FloraSense DB] MongoDB URI is missing.');
    return false;
  }

  try {
    console.log('[FloraSense DB] Connecting to MongoDB...');

    client = new MongoClient(mongoUri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });

    await client.connect();

    // Use the database specified in the MongoDB URI.
    db = client.db();

    const actualDatabase = db.databaseName;

    if (actualDatabase !== DATABASE_NAME) {
      throw new Error(
        `Wrong database selected: ${actualDatabase}. Expected: ${DATABASE_NAME}`
      );
    }

    collection = db.collection(COLLECTION_NAME);

    await collection.createIndex({ timestamp: -1 });

    connectionStatus = 'connected';
    lastError = null;

    console.log(
      `[FloraSense DB] Successfully connected to database: ${actualDatabase}, collection: ${COLLECTION_NAME}`
    );

    return true;

  } catch (err) {
    connectionStatus = 'disconnected';
    lastError = sanitizeMongoError(err, mongoUri);

    console.warn(
      `[FloraSense DB] MongoDB connection failed: ${lastError}`
    );

    if (client) {
      await client.close().catch(() => {});
    }

    client = null;
    db = null;
    collection = null;

    return false;
  }
}

function getDbStatus() {
  return {
    connected: connectionStatus === 'connected',
    status: connectionStatus,
    database: DATABASE_NAME,
    collection: COLLECTION_NAME,
    message: connectionStatus === 'connected'
      ? 'MongoDB Connected'
      : (lastError || 'MongoDB Disconnected')
  };
}

async function saveReading(reading) {
  latestMemoryReading = reading;
  memoryHistory.push(reading);

  if (memoryHistory.length > MAX_MEMORY_HISTORY) {
    memoryHistory.shift();
  }

  if (connectionStatus === 'connected' && collection) {
    try {
      const doc = { ...reading };
      const result = await collection.insertOne(doc);

      return {
        ...doc,
        _id: result.insertedId,
        persistedToDb: true
      };

    } catch (err) {
      console.error(
        '[FloraSense DB] Insert error:',
        sanitizeMongoError(err)
      );

      return { ...reading, persistedToDb: false };
    }
  }

  return { ...reading, persistedToDb: false };
}

async function getLatestReading() {
  if (connectionStatus === 'connected' && collection) {
    try {
      const latest = await collection.findOne(
        {},
        { sort: { timestamp: -1, _id: -1 } }
      );

      if (latest) return latest;

    } catch (err) {
      console.error(
        '[FloraSense DB] Query error:',
        sanitizeMongoError(err)
      );
    }
  }

  return latestMemoryReading;
}

async function getHistory(limit = 100) {
  const boundedLimit = Math.max(
    1,
    Math.min(2000, Number(limit) || 100)
  );

  if (connectionStatus === 'connected' && collection) {
    try {
      const docs = await collection
        .find({})
        .sort({ timestamp: -1, _id: -1 })
        .limit(boundedLimit)
        .toArray();

      return docs.reverse();

    } catch (err) {
      console.error(
        '[FloraSense DB] History query error:',
        sanitizeMongoError(err)
      );
    }
  }

  return memoryHistory.slice(-boundedLimit);
}

async function closeDb() {
  if (client) {
    await client.close();
  }

  client = null;
  db = null;
  collection = null;
  connectionStatus = 'disconnected';
}

module.exports = {
  initDb,
  getDbStatus,
  saveReading,
  getLatestReading,
  getHistory,
  closeDb,
  sanitizeMongoError
};
