const express = require('express');
const authRoutes = require('./auth');
const subscriptionRoutes = require('./subscription');
const premiumRoutes = require('./premium');
const transactionRoutes = require('./transactions');
const categoryRoutes = require('./categories');
const cardRoutes = require('./cards');
const accountRoutes = require('./accounts');

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

// Rotas de transações
router.use('/transactions', transactionRoutes);

// Rotas de categorias
router.use('/categories', categoryRoutes);

// Rotas de cartões
router.use('/cards', cardRoutes);

// Rotas de contas
router.use('/accounts', accountRoutes);

// Rotas de assinatura premium
router.use('/subscription', subscriptionRoutes);

// Rotas premium
router.use('/premium', premiumRoutes);

module.exports = router;
