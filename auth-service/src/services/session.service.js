/**
 * Session Service — Repository Pattern
 *
 * Abstracts all Redis session operations behind clean methods.
 * Handles refresh token storage, lookup, deletion, and multi-device management.
 *
 * Redis key patterns:
 *   refresh:<token>         → Hash { userId, deviceId, userAgent, ip, createdAt }
 *   user_sessions:<userId>  → Set of refresh tokens
 */

const redis = require('../db/redis');
const config = require('../config');
const logger = require('../logger');

const REFRESH_PREFIX = 'refresh:';
const SESSION_PREFIX = 'user_sessions:';

async function createSession(refreshToken, userId, deviceId, meta = {}) {
  const key = REFRESH_PREFIX + refreshToken;
  const sessionKey = SESSION_PREFIX + userId;

  const fields = {
    userId,
    deviceId,
    userAgent: meta.userAgent || 'Unknown',
    ip: meta.ip || 'Unknown',
    createdAt: Date.now().toString(),
  };

  const pipeline = redis.pipeline();
  pipeline.hset(key, fields);
  pipeline.expire(key, config.jwtRefreshExpiresInSeconds);
  pipeline.sadd(sessionKey, refreshToken);
  await pipeline.exec();

  logger.info('Session created', { userId, deviceId });
}

async function findSession(refreshToken) {
  const data = await redis.hgetall(REFRESH_PREFIX + refreshToken);
  if (!data || !data.userId) return null;
  return data;
}

async function deleteSession(refreshToken, userId) {
  const pipeline = redis.pipeline();
  pipeline.del(REFRESH_PREFIX + refreshToken);
  pipeline.srem(SESSION_PREFIX + userId, refreshToken);
  await pipeline.exec();

  logger.info('Session deleted', { userId });
}

async function deleteAllSessions(userId) {
  const sessionKey = SESSION_PREFIX + userId;
  const tokens = await redis.smembers(sessionKey);

  if (tokens.length > 0) {
    const pipeline = redis.pipeline();
    tokens.forEach((token) => pipeline.del(REFRESH_PREFIX + token));
    pipeline.del(sessionKey);
    await pipeline.exec();
  }

  logger.warn('All sessions nuked', { userId, count: tokens.length });
}

async function revokeDeviceSession(userId, deviceId) {
  const sessionKey = SESSION_PREFIX + userId;
  const tokens = await redis.smembers(sessionKey);

  for (const token of tokens) {
    const data = await redis.hgetall(REFRESH_PREFIX + token);
    if (data && data.deviceId === deviceId) {
      await deleteSession(token, userId);
      return true;
    }
  }
  return false;
}

async function listSessions(userId) {
  const sessionKey = SESSION_PREFIX + userId;
  const tokens = await redis.smembers(sessionKey);

  const sessions = [];
  for (const token of tokens) {
    const data = await redis.hgetall(REFRESH_PREFIX + token);
    if (data && data.userId) {
      sessions.push({
        deviceId: data.deviceId,
        userAgent: data.userAgent,
        ip: data.ip,
        createdAt: parseInt(data.createdAt, 10),
      });
    }
  }

  // Sort by most recent first
  sessions.sort((a, b) => b.createdAt - a.createdAt);
  return sessions;
}

async function deleteSessionByDeviceId(userId, deviceId) {
  const sessionKey = SESSION_PREFIX + userId;
  const tokens = await redis.smembers(sessionKey);

  for (const token of tokens) {
    const data = await redis.hgetall(REFRESH_PREFIX + token);
    if (data && data.deviceId === deviceId) {
      await deleteSession(token, userId);
      logger.info('Session revoked by deviceId', { userId, deviceId });
      return true;
    }
  }
  return false;
}

module.exports = {
  createSession,
  findSession,
  deleteSession,
  deleteAllSessions,
  revokeDeviceSession,
  listSessions,
  deleteSessionByDeviceId,
};
