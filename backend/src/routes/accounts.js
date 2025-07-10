const express = require('express');
const AccountController = require('../controllers/AccountController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Aplicar middleware de autenticação
router.use(auth);

// Rotas
router.get('/', AccountController.index);
router.post('/', AccountController.create);
router.put('/:id', AccountController.update);
router.delete('/:id', AccountController.delete);

module.exports = router;
