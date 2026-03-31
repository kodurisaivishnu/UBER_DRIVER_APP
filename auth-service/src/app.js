const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./logger');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Security middleware ---
app.use(helmet());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

// --- Parsers ---
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// --- HTTP request logging (morgan-style via winston) ---
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
    });
  });
  next();
});

// --- Rate limiter for auth endpoints (defense-in-depth) ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many attempts. Try again after 15 minutes.',
  },
});

// --- Health check (no rate limit, no auth) ---
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- Auth routes ---
app.use('/login', authLimiter);
app.use('/register', authLimiter);
app.use('/', authRoutes);

// --- Error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
