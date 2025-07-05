const express = require('express');
const PremiumController = require('../controllers/PremiumController');
const authMiddleware = require('../middlewares/auth');
const { addPremiumInfo } = require('../middlewares/premium');
const { activatePremiumValidation } = require('../utils/validations');

const router = express.Router();

// Todas as rotas premium requerem autenticação
router.use(authMiddleware);
router.use(addPremiumInfo);

// Rotas públicas (para usuários autenticados)
router.get('/plans', PremiumController.getPlans);
router.get('/status', PremiumController.getStatus);
router.get('/history', PremiumController.getHistory);
router.get('/feature/:feature', PremiumController.checkFeature);

// Rotas de ação
router.post('/activate', activatePremiumValidation, PremiumController.activate);
router.post('/cancel', PremiumController.cancel);

module.exports = router;
