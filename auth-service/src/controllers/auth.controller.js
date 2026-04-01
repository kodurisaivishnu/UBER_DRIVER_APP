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
    sameSite: config.env === 'production' ? 'none' : 'strict',
    path: '/',
    maxAge: config.jwtRefreshExpiresInSeconds * 1000,
  };
}

// Extract device metadata from request
function getDeviceMeta(req) {
  return {
    userAgent: req.headers['user-agent'] || 'Unknown',
    ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.ip
      || 'Unknown',
  };
}

// POST /register
async function register(req, res, next) {
  try {
    const { email, password, name, role } = req.body;

    const existing = await User.findOne({ email, role });
    if (existing) {
      throw new ApiError(409, `Already registered as ${role}`);
    }

    const passwordHash = await authService.hashPassword(password);
    const user = await User.create({ email, passwordHash, name, role });

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
    const { email, password, deviceId, role } = req.body;

    const accounts = await User.find({ email }).select('+passwordHash');
    if (accounts.length === 0) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const valid = await authService.comparePassword(password, accounts[0].passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const roles = accounts.map((a) => a.role);

    if (roles.length > 1 && !role) {
      return res.json({
        status: 'role_required',
        message: 'Multiple accounts found. Please select a role.',
        data: { roles },
      });
    }

    const user = role
      ? accounts.find((a) => a.role === role)
      : accounts[0];

    if (!user) {
      throw new ApiError(401, `No account found with role: ${role}`);
    }

    await sessionService.revokeDeviceSession(user.id, deviceId);

    const accessToken = authService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    });
    const refreshToken = authService.generateRefreshToken();

    await sessionService.createSession(refreshToken, user.id, deviceId, getDeviceMeta(req));

    logger.info('Login success', { userId: user.id, role: user.role, deviceId });

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
      logger.warn('Refresh token not found (possible theft)', { tokenPrefix: oldToken.slice(0, 8) });
      throw new ApiError(401, 'Invalid refresh token');
    }

    const { userId, deviceId } = session;

    await sessionService.deleteSession(oldToken, userId);

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    const accessToken = authService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    });
    const refreshToken = authService.generateRefreshToken();

    await sessionService.createSession(refreshToken, userId, deviceId, getDeviceMeta(req));

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

// GET /sessions — list all active sessions for this user
async function getSessions(req, res, next) {
  try {
    const sessions = await sessionService.listSessions(req.user.userId);
    const currentDeviceId = req.user.deviceId;

    const result = sessions.map((s) => ({
      ...s,
      isCurrent: s.deviceId === currentDeviceId,
    }));

    res.json({ status: 'success', data: { sessions: result } });
  } catch (err) {
    next(err);
  }
}

// DELETE /sessions/:deviceId — logout a specific device
async function deleteSessionByDevice(req, res, next) {
  try {
    const { deviceId } = req.params;

    if (deviceId === req.user.deviceId) {
      throw new ApiError(400, 'Cannot revoke current session. Use /logout instead.');
    }

    const revoked = await sessionService.deleteSessionByDeviceId(req.user.userId, deviceId);
    if (!revoked) {
      throw new ApiError(404, 'Session not found');
    }

    res.json({ status: 'success', message: 'Session revoked' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, logoutAll, me, getSessions, deleteSessionByDevice };
