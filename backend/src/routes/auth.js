const express = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../utils/validations');

const router = express.Router();

// Rotas públicas
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);

// Rotas protegidas (requerem autenticação)
router.get('/me', authMiddleware, AuthController.me);
router.put('/profile', authMiddleware, updateProfileValidation, AuthController.updateProfile);
router.put('/change-password', authMiddleware, changePasswordValidation, AuthController.changePassword);

module.exports = router;
