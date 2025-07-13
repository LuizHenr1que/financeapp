require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const routes = require('./routes');
const prisma = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: '*', // Temporariamente permitir todas as origens para debug
  credentials: true
}));

// Rate limiting (desabilitado temporariamente para desenvolvimento)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 1000, // máximo 1000 requests por IP por window (aumentado para desenvolvimento)
//   message: {
//     error: 'Muitas tentativas. Tente novamente em 15 minutos.'
//   },
//   // Pular rate limiting para localhost durante desenvolvimento
//   skip: (req) => {
//     return req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1';
//   }
// });

// Rate limiting mais restritivo para login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP por window
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth/login', authLimiter);
// app.use('/api', limiter); // Desabilitado temporariamente

// Middleware para capturar corpo bruto
app.use((req, res, next) => {
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk.toString();
  });
  req.on('end', () => {
    req.rawBody = rawBody;
    next();
  });
});

// Middleware customizado para parsing de JSON (mesmo com content-type incorreto)
app.use((req, res, next) => {
  if (req.rawBody && req.rawBody.startsWith('{') && !req.body) {
    try {
      req.body = JSON.parse(req.rawBody);
      console.log('🔧 JSON parseado manualmente:', req.body);
    } catch (error) {
      console.error('❌ Erro ao parsear JSON:', error);
    }
  }
  next();
});

// Middlewares gerais
app.use(morgan('combined'));

// Middleware para log do body das requisições
app.use((req, res, next) => {
  console.log('📥 Request Details:', {
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
    },
    rawBody: req.rawBody,
    body: req.body
  });
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos da pasta public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Rotas
app.use('/api', routes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON inválido'
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});
console.log('🔎 DATABASE_URL:', process.env.DATABASE_URL);

// Função para iniciar o servidor
async function startServer() {
  try {
    // Testar conexão com o banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 API disponível em http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de encerramento graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Encerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Desconectado do banco de dados');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Encerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Desconectado do banco de dados');
  process.exit(0);
});

// Iniciar servidor
startServer();
