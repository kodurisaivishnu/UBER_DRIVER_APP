/**
 * Authentication Middleware — Chain of Responsibility Pattern
 *
 * Extracts Bearer token from Authorization header,
 * verifies JWT, attaches decoded payload to req.user.
 */

const authService = require('../services/auth.service');
const ApiError = require('../utils/ApiError');
const logger = require('../logger');

function authenticate(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    logger.warn('No token provided', { ip: req.ip, path: req.path });
    return next(new ApiError(401, 'Access token required'));
  }

  const token = header.slice(7);

  try {
    const decoded = authService.verifyAccessToken(token);
    req.user = decoded;
    logger.debug('JWT verified', { userId: decoded.userId });
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token';
    logger.warn(message, { ip: req.ip, error: err.name });
    next(new ApiError(401, message));
  }
}

module.exports = authenticate;
