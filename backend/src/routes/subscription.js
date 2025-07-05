const express = require('express');
const SubscriptionController = require('../controllers/SubscriptionController');
const authMiddleware = require('../middlewares/auth');
const { activatePremiumValidation } = require('../utils/validations');

const router = express.Router();

// Rotas públicas
router.get('/plans', SubscriptionController.getPlans);

// Rotas protegidas (requerem autenticação)
router.get('/status', authMiddleware, SubscriptionController.getStatus);
router.post('/activate', authMiddleware, activatePremiumValidation, SubscriptionController.activatePremium);
router.delete('/cancel', authMiddleware, SubscriptionController.cancelPremium);
router.get('/history', authMiddleware, SubscriptionController.getHistory);

module.exports = router;
