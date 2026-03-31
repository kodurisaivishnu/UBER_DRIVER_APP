/**
 * Auth Service — Factory Pattern
 *
 * Encapsulates token creation and password operations.
 * Stateless — no side effects, no DB calls.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');

const SALT_ROUNDS = 12;

function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

function comparePassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

function generateAccessToken({ userId, email, role, deviceId }) {
  return jwt.sign(
    { userId, email, role, deviceId },
    config.jwtSecret,
    {
      expiresIn: config.jwtAccessExpiresIn,
      issuer: 'uber-driver-auth',
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret, { issuer: 'uber-driver-auth' });
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
};
