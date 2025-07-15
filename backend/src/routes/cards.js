const express = require('express');
const CardController = require('../controllers/CardController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Aplicar middleware de autenticação
router.use(auth);

// Rotas
router.get('/', CardController.index);
router.post('/', CardController.create);

module.exports = router;
