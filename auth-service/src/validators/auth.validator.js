const { body } = require('express-validator');

const register = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a digit')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain a special character'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['driver', 'rider'])
    .withMessage('Role must be driver or rider'),
];

const login = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  body('deviceId')
    .trim()
    .notEmpty()
    .withMessage('deviceId is required'),
];

module.exports = { register, login };
