const User = require('../models/User');
const authService = require('../services/auth.service');
const sessionService = require('../services/session.service');
const ApiError = require('../utils/ApiError');
const config = require('../config');
const logger = require('../logger');

// Cookie options for refresh token
function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'strict',
    path: '/',
    maxAge: config.jwtRefreshExpiresInSeconds * 1000,
  };
}

// POST /register
async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    const passwordHash = await authService.hashPassword(password);
    const user = await User.create({ email, passwordHash, name });

    logger.info('User registered', { email: user.email, userId: user.id });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please login.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

// POST /login
async function login(req, res, next) {
  try {
    const { email, password, deviceId } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const valid = await authService.comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Revoke existing session for this device (prevent session leaks on re-login)
    await sessionService.revokeDeviceSession(user.id, deviceId);

    // Generate tokens
    const accessToken = authService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    });
    const refreshToken = authService.generateRefreshToken();

    // Store refresh token in Redis
    await sessionService.createSession(refreshToken, user.id, deviceId);

    logger.info('Login success', { userId: user.id, deviceId });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, cookieOptions());

    res.json({
      status: 'success',
      data: {
        accessToken,
        user: user.toJSON(),
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /refresh
async function refresh(req, res, next) {
  try {
    const oldToken = req.cookies?.refreshToken;
    if (!oldToken) {
      throw new ApiError(401, 'Refresh token required');
    }

    const session = await sessionService.findSession(oldToken);

    if (!session) {
      // Possible token theft — nuke all sessions if we can decode the old token
      logger.warn('Refresh token not found (possible theft)', { tokenPrefix: oldToken.slice(0, 8) });
      throw new ApiError(401, 'Invalid refresh token');
    }

    const { userId, deviceId } = session;

    // Delete old refresh token (rotation)
    await sessionService.deleteSession(oldToken, userId);

    // Fetch user to get latest data for new JWT
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Generate new token pair
    const accessToken = authService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    });
    const refreshToken = authService.generateRefreshToken();

    await sessionService.createSession(refreshToken, userId, deviceId);

    logger.info('Token refreshed', { userId, deviceId });

    res.cookie('refreshToken', refreshToken, cookieOptions());

    res.json({
      status: 'success',
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
}

// POST /logout
async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await sessionService.deleteSession(token, req.user.userId);
    }

    logger.info('Logout', { userId: req.user.userId, deviceId: req.user.deviceId });

    res.clearCookie('refreshToken', { path: '/' });

    res.json({ status: 'success', message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

// POST /logout-all
async function logoutAll(req, res, next) {
  try {
    await sessionService.deleteAllSessions(req.user.userId);

    logger.info('Logout all devices', { userId: req.user.userId });

    res.clearCookie('refreshToken', { path: '/' });

    res.json({ status: 'success', message: 'Logged out from all devices' });
  } catch (err) {
    next(err);
  }
}

// GET /me
async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, logoutAll, me };
