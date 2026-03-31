const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8081,

  // External MongoDB
  mongoUri: process.env.MONGO_URI,

  // External Redis (Upstash — uses TLS via rediss://)
  redisUrl: process.env.REDIS_URL,

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresInSeconds: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS, 10) || 604800,

  // CORS
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000'],

  // Cookie
  cookieSecure: process.env.COOKIE_SECURE === 'true',

  // Logging
  logOutput: process.env.LOG_OUTPUT || 'both',
};

// Fail fast if critical secrets are missing
if (!config.jwtSecret) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

if (!config.mongoUri) {
  console.error('FATAL: MONGO_URI environment variable is required');
  process.exit(1);
}

if (!config.redisUrl) {
  console.error('FATAL: REDIS_URL environment variable is required');
  process.exit(1);
}

Object.freeze(config);

module.exports = config;
