const express = require('express');
const { body } = require('express-validator');
const TransactionController = require('../controllers/TransactionController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Validações para criação de transação
const transactionValidation = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Tipo deve ser income ou expense'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser maior que zero'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Descrição é obrigatória e deve ter no máximo 500 caracteres'),
  body('date')
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601'),
  body('categoryId')
    .isLength({ min: 1 })
    .withMessage('ID da categoria é obrigatório'),
  body('accountId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('ID da conta deve ser válido'),
  body('cardId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('ID do cartão deve ser válido'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'pix', 'card'])
    .withMessage('Método de pagamento deve ser cash, pix ou card'),
  body('launchType')
    .optional()
    .isIn(['unico', 'recorrente', 'parcelado'])
    .withMessage('Tipo de lançamento deve ser unico, recorrente ou parcelado'),
  body('installments')
    .optional()
    .isInt({ min: 1, max: 360 })
    .withMessage('Número de parcelas deve ser entre 1 e 360'),
  body('valorComoParcela')
    .optional()
    .isBoolean()
    .withMessage('valorComoParcela deve ser um boolean'),
  body('recurrenceType')
    .optional()
    .isIn(['Anual', 'Mensal', 'Semanal'])
    .withMessage('Tipo de recorrência deve ser Anual, Mensal ou Semanal'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Título deve ter no máximo 200 caracteres')
];

// Aplicar middleware de autenticação em todas as rotas
router.use(auth);

// Rotas
router.post('/', transactionValidation, TransactionController.create);
router.get('/', TransactionController.index);
router.get('/:id', TransactionController.show);
router.put('/:id', TransactionController.update);
router.delete('/:id', TransactionController.delete);

module.exports = router;
