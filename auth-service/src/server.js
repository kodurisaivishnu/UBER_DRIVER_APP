const config = require('./config');
const logger = require('./logger');
const connectMongo = require('./db/mongo');
require('./db/redis'); // initialize Redis connection (singleton)
const app = require('./app');

async function start() {
  await connectMongo();

  app.listen(config.port, () => {
    logger.info(`Auth service listening on port ${config.port}`, {
      env: config.env,
      logOutput: config.logOutput,
    });
  });
}

start().catch((err) => {
  logger.error('Failed to start auth service', { error: err.message });
  process.exit(1);
});
