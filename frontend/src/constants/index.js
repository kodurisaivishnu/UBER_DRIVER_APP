export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
};

export const API = {
  REGISTER: '/register',
  LOGIN: '/login',
  REFRESH: '/refresh',
  LOGOUT: '/logout',
  LOGOUT_ALL: '/logout-all',
  ME: '/me',
  SESSIONS: '/sessions',
};

export const MESSAGES = {
  REGISTER_SUCCESS: 'Registration successful! Please login.',
  LOGIN_FAILED: 'Invalid email or password',
  SESSION_EXPIRED: 'Session expired. Please login again.',
  NETWORK_ERROR: 'Network error. Check your connection.',
  LOGOUT_SUCCESS: 'Logged out successfully',
  LOGOUT_ALL_SUCCESS: 'Logged out from all devices',
  TOO_MANY_ATTEMPTS: 'Too many attempts. Try again later.',
  EMAIL_EXISTS: 'This email is already registered.',
  SESSION_REVOKED: 'Device logged out successfully',
};

export const CONFIG = {
  DEVICE_ID_KEY: 'uber_driver_device_id',
};

export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  PATTERNS: {
    UPPERCASE: /[A-Z]/,
    LOWERCASE: /[a-z]/,
    DIGIT: /[0-9]/,
    SPECIAL: /[^A-Za-z0-9]/,
  },
  LABELS: {
    MIN_LENGTH: 'At least 8 characters',
    UPPERCASE: 'One uppercase letter',
    LOWERCASE: 'One lowercase letter',
    DIGIT: 'One number',
    SPECIAL: 'One special character',
  },
};
