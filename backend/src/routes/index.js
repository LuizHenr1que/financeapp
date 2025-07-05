const express = require('express');
const authRoutes = require('./auth');
const subscriptionRoutes = require('./subscription');
const premiumRoutes = require('./premium');

const router = express.Router();

// Rota de healthcheck
router.get('/health', (req, res) => {
  res.json({
    message: 'API InFinance está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de assinatura premium
router.use('/subscription', subscriptionRoutes);

// Rotas premium
router.use('/premium', premiumRoutes);

module.exports = router;
