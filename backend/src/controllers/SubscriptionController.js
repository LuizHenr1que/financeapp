const { validationResult } = require('express-validator');
const prisma = require('../config/database');

class SubscriptionController {
  // Listar planos premium disponíveis
  async getPlans(req, res) {
    try {
      const plans = await prisma.premiumPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
      });

      res.json({
        plans
      });
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Verificar status premium do usuário
  async getStatus(req, res) {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          isPremium: true,
          premiumPlan: true,
          premiumStartDate: true,
          premiumEndDate: true
        }
      });

      // Verificar se o premium expirou
      const now = new Date();
      let isPremiumActive = user.isPremium;

      if (user.isPremium && user.premiumEndDate && user.premiumEndDate < now) {
        // Premium expirou, atualizar status
        await prisma.user.update({
          where: { id: userId },
          data: {
            isPremium: false,
            premiumPlan: null,
            premiumEndDate: null
          }
        });
        isPremiumActive = false;
      }

      res.json({
        isPremium: isPremiumActive,
        plan: isPremiumActive ? user.premiumPlan : null,
        startDate: isPremiumActive ? user.premiumStartDate : null,
        endDate: isPremiumActive ? user.premiumEndDate : null,
        daysRemaining: isPremiumActive && user.premiumEndDate 
          ? Math.ceil((user.premiumEndDate - now) / (1000 * 60 * 60 * 24))
          : null
      });
    } catch (error) {
      console.error('Erro ao verificar status premium:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Ativar premium (simulação - em produção seria após confirmação de pagamento)
  async activatePremium(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { planCode, transactionId } = req.body;
      const userId = req.user.id;

      // Buscar plano
      const plan = await prisma.premiumPlan.findUnique({
        where: { code: planCode }
      });

      if (!plan) {
        return res.status(404).json({
          error: 'Plano não encontrado'
        });
      }

      const now = new Date();
      let endDate = null;

      // Calcular data de fim baseado no plano
      if (plan.duration) {
        endDate = new Date(now.getTime() + (plan.duration * 24 * 60 * 60 * 1000));
      }

      // Atualizar usuário
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumPlan: plan.code,
          premiumStartDate: now,
          premiumEndDate: endDate
        },
        select: {
          id: true,
          name: true,
          email: true,
          isPremium: true,
          premiumPlan: true,
          premiumStartDate: true,
          premiumEndDate: true
        }
      });

      // Criar registro de assinatura
      await prisma.subscription.create({
        data: {
          userId,
          plan: plan.code,
          status: 'active',
          startDate: now,
          endDate,
          amount: plan.price,
          currency: plan.currency,
          transactionId: transactionId || null,
          paymentMethod: 'simulated' // Em produção seria o método real
        }
      });

      res.json({
        message: 'Premium ativado com sucesso',
        user: updatedUser
      });

    } catch (error) {
      console.error('Erro ao ativar premium:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  // Cancelar premium
  async cancelPremium(req, res) {
    try {
      const userId = req.user.id;

      // Atualizar usuário
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: false,
          premiumPlan: null,
          premiumStartDate: null,
          premiumEndDate: null
        },
        select: {
          id: true,
          name: true,
          email: true,
          isPremium: true,
          premiumPlan: true,
          premiumStartDate: true,
          premiumEndDate: true
        }
      });

      // Atualizar assinatura ativa para cancelada
      await prisma.subscription.updateMany({
        where: {
          userId,
          status: 'active'
        },
        data: {
          status: 'cancelled'
        }
      });

      res.json({
        message: 'Premium cancelado com sucesso',
        user: updatedUser
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
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        subscriptions
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new SubscriptionController();
