/**
 * Redis Connection — Singleton Pattern
 *
 * Creates ONE ioredis client on first require().
 * Configured for Upstash (serverless Redis with TLS).
 *
 * Upstash closes idle connections aggressively, so:
 *   - keepAlive is enabled
 *   - enableOfflineQueue ensures commands queue while reconnecting
 *   - tls is explicitly set for rediss:// protocol
 */

const Redis = require('ioredis');
const config = require('../config');
const logger = require('../logger');

const redis = new Redis(config.redisUrl, {
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
  keepAlive: 10000,
  connectTimeout: 10000,
  retryStrategy(times) {
    if (times > 10) return null;
    return Math.min(times * 500, 5000);
  },
  reconnectOnError(err) {
    // Reconnect on EPIPE / connection reset errors
    return err.message.includes('EPIPE') || err.message.includes('ECONNRESET');
  },
});

redis.on('connect', () => {
  logger.info('Redis connected (Upstash)');
});

redis.on('error', (err) => {
  // Suppress noisy EPIPE logs during reconnection
  if (err.message.includes('EPIPE')) return;
  logger.error('Redis connection error', { error: err.message });
});

module.exports = redis;
