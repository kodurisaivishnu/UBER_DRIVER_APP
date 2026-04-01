const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const validators = require('../validators/auth.validator');

const router = Router();

router.post('/register', validators.register, validate, controller.register);
router.post('/login', validators.login, validate, controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.post('/logout-all', authenticate, controller.logoutAll);
router.get('/me', authenticate, controller.me);
router.get('/sessions', authenticate, controller.getSessions);
router.delete('/sessions/:deviceId', authenticate, controller.deleteSessionByDevice);

module.exports = router;
