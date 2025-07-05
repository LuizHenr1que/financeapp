const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve ser válido')
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  
  body('phone')
    .optional({ nullable: true })
    .custom(value => {
      if (value === null || value === '') return true;
      return /^[0-9]{10,11}$/.test(value.replace(/\D/g, ''));
    })
    .withMessage('Telefone deve ser válido'),
  
  body('avatar')
    .optional({ nullable: true })
    .isURL()
    .withMessage('Avatar deve ser uma URL válida')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
];

const activatePremiumValidation = [
  body('planCode')
    .notEmpty()
    .withMessage('Código do plano é obrigatório')
    .isIn(['monthly', 'yearly', 'lifetime'])
    .withMessage('Código do plano deve ser: monthly, yearly ou lifetime'),
  
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'pix', 'boleto', 'paypal'])
    .withMessage('Método de pagamento inválido')
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  activatePremiumValidation
};
