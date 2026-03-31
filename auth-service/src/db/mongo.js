/**
 * MongoDB Connection — Singleton Pattern
 *
 * Mongoose maintains a single connection pool internally.
 * This module connects once; subsequent require() calls are no-ops.
 */

const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../logger');

async function connectMongo() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('MongoDB connected', { uri: config.mongoUri.replace(/\/\/.*@/, '//<credentials>@') });
  } catch (err) {
    logger.error('MongoDB connection failed', { error: err.message });
    process.exit(1);
  }
}

module.exports = connectMongo;
