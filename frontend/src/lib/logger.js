/**
 * Frontend Logger — Singleton Pattern
 *
 * Terminal-only (browser console). Environment-aware.
 * Development: logs everything (debug, info, warn, error)
 * Production: logs only warn + error
 */

const isDev = import.meta.env.DEV;

const noop = () => {};

const logger = {
  debug: isDev ? console.debug.bind(console, '[DEBUG]') : noop,
  info: isDev ? console.info.bind(console, '[INFO]') : noop,
  warn: console.warn.bind(console, '[WARN]'),
  error: console.error.bind(console, '[ERROR]'),
};

export default logger;
