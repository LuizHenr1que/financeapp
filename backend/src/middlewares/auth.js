const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('\n🔐 === VERIFICAÇÃO DE AUTENTICAÇÃO ===');
    console.log('📥 Headers da requisição:', req.headers);
    
    // Pegar o token do header Authorization
    const authHeader = req.headers.authorization;
    
    console.log('🔑 Header Authorization:', authHeader || 'AUSENTE');
    
    if (!authHeader) {
      console.log('❌ Token de acesso não fornecido');
      return res.status(401).json({ 
        error: 'Token de acesso requerido' 
      });
    }

    // Verificar se o token começa com "Bearer "
    const token = authHeader.split(' ')[1];
    
    console.log('🎫 Token extraído:', token ? `${token.substring(0, 20)}...` : 'NULO');
    
    if (!token) {
      console.log('❌ Token de acesso inválido');
      return res.status(401).json({ 
        error: 'Token de acesso inválido' 
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('🔓 Token decodificado:', { userId: decoded.userId });
    
    // Buscar o usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado no banco de dados para ID:', decoded.userId);
      return res.status(401).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    console.log('✅ Usuário autenticado:', { id: user.id, email: user.email, name: user.name });
    console.log('🔐 === FIM DA VERIFICAÇÃO ===\n');

    // Adicionar usuário ao request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado' 
      });
    }

    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

module.exports = authMiddleware;
