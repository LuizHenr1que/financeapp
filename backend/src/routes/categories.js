const express = require('express');
const CategoryController = require('../controllers/CategoryController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Aplicar middleware de autenticação
router.use(auth);

// Rotas
router.get('/', CategoryController.index);

module.exports = router;
