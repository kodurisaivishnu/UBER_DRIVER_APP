/**
 * Centralized Error Handler
 *
 * Catches all errors thrown in the request pipeline.
 * Returns JSON response with appropriate status code.
 * Stack traces included only in non-production.
 */

const config = require('../config');
const logger = require('../logger');

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error(message, {
    statusCode,
    stack: err.stack,
  });

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.env !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
