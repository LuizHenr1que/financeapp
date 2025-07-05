const PremiumService = require('../services/PremiumService');

// Middleware para verificar se o usuário é premium
const premiumRequired = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isPremium = await PremiumService.isPremiumActive(userId);
    
    if (!isPremium) {
      return res.status(403).json({
        error: 'Recurso premium necessário',
        message: 'Esta funcionalidade está disponível apenas para usuários premium',
        upgrade_url: '/api/premium/plans'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro no middleware premium:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware para adicionar info premium ao req
const addPremiumInfo = async (req, res, next) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const isPremium = await PremiumService.isPremiumActive(userId);
      const features = await PremiumService.getAvailableFeatures(userId);
      
      req.premium = {
        isActive: isPremium,
        features
      };
    }
    
    next();
  } catch (error) {
    console.error('Erro ao adicionar info premium:', error);
    next(); // Continua mesmo com erro
  }
};

module.exports = {
  premiumRequired,
  addPremiumInfo
};
