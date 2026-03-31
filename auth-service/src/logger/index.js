/**
 * Logger — Singleton Pattern
 *
 * Created ONCE on first require(). Node's module cache ensures
 * every require('../logger') returns the SAME instance.
 *
 * Strategy Pattern: LOG_OUTPUT env var selects transports.
 *   "both"     → terminal + file
 *   "terminal" → terminal only
 *   "file"     → file only
 *   "none"     → no output
 */

const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

const config = require('../config');

const LOGS_DIR = path.join(__dirname, '../../logs');

// --- Formats ---

const timestampFormat = winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss',
});

const terminalFormat = winston.format.combine(
  timestampFormat,
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  timestampFormat,
  winston.format.json()
);

// --- Transports ---

function buildTransports(output) {
  const transports = [];

  const wantsTerminal = output === 'both' || output === 'terminal';
  const wantsFile = output === 'both' || output === 'file';

  if (wantsTerminal) {
    transports.push(
      new winston.transports.Console({ format: terminalFormat })
    );
  }

  if (wantsFile) {
    // All logs — rotates at 5MB, keeps 5 files max
    transports.push(
      new winston.transports.DailyRotateFile({
        dirname: LOGS_DIR,
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '5m',
        maxFiles: 5,
        format: fileFormat,
      })
    );

    // Errors only
    transports.push(
      new winston.transports.DailyRotateFile({
        dirname: LOGS_DIR,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '5m',
        maxFiles: 5,
        level: 'error',
        format: fileFormat,
      })
    );
  }

  // "none" → silent transport so winston doesn't complain
  if (transports.length === 0) {
    transports.push(new winston.transports.Console({ silent: true }));
  }

  return transports;
}

// --- Create singleton logger ---

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  transports: buildTransports(config.logOutput),
});

module.exports = logger;
