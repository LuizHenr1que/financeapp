const PremiumService = require('../services/PremiumService');
const { validationResult } = require('express-validator');
const prisma = require('../config/database');

class PremiumController {
  // Obter planos disponíveis
  async getPlans(req, res) {
    try {
      const plans = await PremiumService.getAvailablePlans();
      
      res.json({
        plans
      });
    } catch (error) {
      console.error('Erro ao obter planos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter status premium do usuário
  async getStatus(req, res) {
    try {
      const userId = req.user.id;
      const premiumInfo = await PremiumService.getPremiumInfo(userId);
      const features = await PremiumService.getAvailableFeatures(userId);
      
      res.json({
        premium: premiumInfo,
        features
      });
    } catch (error) {
      console.error('Erro ao obter status premium:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Ativar premium (simulação de pagamento)
  async activate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const userId = req.user.id;
      const { planCode, paymentMethod = 'credit_card' } = req.body;

      // Verificar se já não é premium
      const isAlreadyPremium = await PremiumService.isPremiumActive(userId);
      if (isAlreadyPremium) {
        return res.status(400).json({
          error: 'Usuário já possui assinatura premium ativa'
        });
      }

      const result = await PremiumService.activatePremium(userId, planCode, paymentMethod);
      
      res.status(201).json({
        message: 'Premium ativado com sucesso!',
        user: result.user,
        subscription: result.subscription
      });

    } catch (error) {
      console.error('Erro ao ativar premium:', error);
      
      if (error.message === 'Plano não encontrado') {
        return res.status(404).json({
          error: 'Plano não encontrado'
        });
      }
      
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Cancelar premium
  async cancel(req, res) {
    try {
      const userId = req.user.id;
      const { reason = 'user_request' } = req.body;

      // Verificar se é premium
      const isPremium = await PremiumService.isPremiumActive(userId);
      if (!isPremium) {
        return res.status(400).json({
          error: 'Usuário não possui assinatura premium ativa'
        });
      }

      const user = await PremiumService.cancelPremium(userId, reason);
      
      res.json({
        message: 'Premium cancelado com sucesso',
        user
      });

    } catch (error) {
      console.error('Erro ao cancelar premium:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Histórico de assinaturas
  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      
      const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        include: {
          plan: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json({
        subscriptions
      });

    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Verificar recurso específico
  async checkFeature(req, res) {
    try {
      const userId = req.user.id;
      const { feature } = req.params;
      
      const features = await PremiumService.getAvailableFeatures(userId);
      const hasFeature = features[feature] === true;
      
      res.json({
        feature,
        available: hasFeature,
        isPremium: await PremiumService.isPremiumActive(userId)
      });

    } catch (error) {
      console.error('Erro ao verificar recurso:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new PremiumController();
