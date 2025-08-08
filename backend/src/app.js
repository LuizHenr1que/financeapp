require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const routes = require('./routes');

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));

// Rate limiting para auth (desabilitado durante desenvolvimento)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 tentativas para desenvolvimento
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para auth (COMPLETAMENTE DESABILITADO PARA DEBUG)
// app.use('/api/auth/login', authLimiter);

// Middleware para capturar corpo bruto
app.use((req, res, next) => {
  if (req.path === '/api/subscriptions/webhook') {
    req.rawBody = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      req.rawBody += chunk;
    });
    req.on('end', () => {
      next();
    });
  } else {
    next();
  }
});

// Middlewares
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use('/api', routes);

// Middleware de tratamento de erro 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.originalUrl} não existe`
  });
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro capturado pelo middleware global:', err);

  // Erro de validação do express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.details
    });
  }

  // Erro do Prisma
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: 'Erro no banco de dados',
      message: 'Operação não pôde ser executada'
    });
  }

  // Erro interno do servidor
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

module.exports = app;
