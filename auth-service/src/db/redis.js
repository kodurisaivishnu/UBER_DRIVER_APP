/**
 * Redis Connection — Singleton Pattern
 *
 * Creates ONE ioredis client on first require().
 * Upstash uses TLS (rediss:// protocol) — ioredis handles this automatically.
 */

const Redis = require('ioredis');
const config = require('../config');
const logger = require('../logger');

const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) return null; // stop retrying after 5 attempts
    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => {
  logger.info('Redis connected (Upstash)');
});

redis.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

module.exports = redis;
