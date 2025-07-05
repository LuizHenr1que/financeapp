const prisma = require('../config/database');

class PremiumService {
  // Verificar se o usuário é premium ativo
  static async isPremiumActive(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          isPremium: true,
          premiumEndDate: true,
          premiumPlan: true
        }
      });

      if (!user || !user.isPremium) {
        return false;
      }

      // Se for plano vitalício, sempre é ativo
      if (user.premiumPlan === 'lifetime') {
        return true;
      }

      // Verificar se não expirou
      if (user.premiumEndDate && new Date() > user.premiumEndDate) {
        // Premium expirado, atualizar status
        await this.expirePremium(userId);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar status premium:', error);
      return false;
    }
  }

  // Ativar premium para um usuário
  static async activatePremium(userId, planCode, paymentMethod = 'manual') {
    try {
      // Buscar o plano
      const plan = await prisma.premiumPlan.findUnique({
        where: { code: planCode }
      });

      if (!plan) {
        throw new Error('Plano não encontrado');
      }

      const now = new Date();
      const endDate = plan.duration 
        ? new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000)
        : null; // null para vitalício

      // Atualizar usuário
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumPlan: planCode,
          premiumStartDate: now,
          premiumEndDate: endDate
        }
      });

      // Criar registro de assinatura
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          planCode,
          status: 'active',
          startDate: now,
          endDate: endDate,
          amount: plan.price,
          currency: plan.currency,
          paymentMethod,
          paymentDate: now
        }
      });

      console.log(`✅ Premium ativado para usuário ${userId}: ${planCode}`);
      return { user, subscription };

    } catch (error) {
      console.error('Erro ao ativar premium:', error);
      throw error;
    }
  }

  // Cancelar premium
  static async cancelPremium(userId, reason = 'user_request') {
    try {
      // Atualizar usuário
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: false,
          premiumPlan: null,
          premiumStartDate: null,
          premiumEndDate: null
        }
      });

      // Atualizar assinatura ativa
      await prisma.subscription.updateMany({
        where: {
          userId,
          status: 'active'
        },
        data: {
          status: 'cancelled',
          endDate: new Date(),
          cancellationReason: reason
        }
      });

      console.log(`❌ Premium cancelado para usuário ${userId}`);
      return user;

    } catch (error) {
      console.error('Erro ao cancelar premium:', error);
      throw error;
    }
  }

  // Expirar premium automaticamente
  static async expirePremium(userId) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: false
        }
      });

      await prisma.subscription.updateMany({
        where: {
          userId,
          status: 'active'
        },
        data: {
          status: 'expired',
          endDate: new Date()
        }
      });

      console.log(`⏰ Premium expirado para usuário ${userId}`);
      return user;

    } catch (error) {
      console.error('Erro ao expirar premium:', error);
      throw error;
    }
  }

  // Obter informações do premium do usuário
  static async getPremiumInfo(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          isPremium: true,
          premiumPlan: true,
          premiumStartDate: true,
          premiumEndDate: true
        }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const currentSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'active'
        },
        include: {
          plan: true
        }
      });

      const subscriptionHistory = await prisma.subscription.findMany({
        where: { userId },
        include: {
          plan: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        ...user,
        currentSubscription,
        subscriptionHistory
      };

    } catch (error) {
      console.error('Erro ao obter info premium:', error);
      throw error;
    }
  }

  // Verificar recursos premium disponíveis
  static async getAvailableFeatures(userId) {
    try {
      const isPremium = await this.isPremiumActive(userId);
      
      const freeFeatures = {
        max_transactions: 50,
        basic_reports: true,
        categories: 10,
        accounts: 3,
        goals: 5
      };

      const premiumFeatures = {
        unlimited_transactions: true,
        advanced_reports: true,
        export_data: true,
        priority_support: true,
        custom_categories: true,
        unlimited_accounts: true,
        unlimited_goals: true,
        investment_tracking: true,
        financial_goals: true,
        ai_insights: true
      };

      return isPremium ? premiumFeatures : freeFeatures;

    } catch (error) {
      console.error('Erro ao obter features:', error);
      return freeFeatures;
    }
  }

  // Listar planos disponíveis
  static async getAvailablePlans() {
    try {
      return await prisma.premiumPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
      });
    } catch (error) {
      console.error('Erro ao obter planos:', error);
      throw error;
    }
  }
}

module.exports = PremiumService;
