const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes (cuidado em produção!)
    await prisma.subscription.deleteMany();
    await prisma.premiumPlan.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.card.deleteMany();
    await prisma.category.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // Criar usuário de exemplo
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const user = await prisma.user.create({
      data: {
        name: 'Usuário Exemplo',
        email: 'usuario@exemplo.com',
        password: hashedPassword,
        phone: '11999999999'
      }
    });

    console.log('✅ Usuário criado:', user.email);

    // Criar planos premium
    const premiumPlans = await prisma.premiumPlan.createMany({
      data: [
        {
          name: 'Premium Mensal',
          code: 'monthly',
          price: 9.90,
          currency: 'BRL',
          duration: 30,
          features: {
            unlimited_transactions: true,
            advanced_reports: true,
            export_data: true,
            priority_support: true,
            custom_categories: true
          }
        },
        {
          name: 'Premium Anual',
          code: 'yearly',
          price: 89.90,
          currency: 'BRL',
          duration: 365,
          features: {
            unlimited_transactions: true,
            advanced_reports: true,
            export_data: true,
            priority_support: true,
            custom_categories: true,
            investment_tracking: true,
            financial_goals: true
          }
        },
        {
          name: 'Premium Vitalício',
          code: 'lifetime',
          price: 199.90,
          currency: 'BRL',
          duration: null,
          features: {
            unlimited_transactions: true,
            advanced_reports: true,
            export_data: true,
            priority_support: true,
            custom_categories: true,
            investment_tracking: true,
            financial_goals: true,
            ai_insights: true,
            white_label: true
          }
        }
      ]
    });

    console.log('✅ Planos premium criados:', premiumPlans.count);

    // Cores e ícones disponíveis na tela de categorias
    const categoryColors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
      '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
      '#00d2d3', '#ff9f43', '#10ac84', '#ee5253',
    ];
    const categoryIcons = [
      'Circle', 'ShoppingCart', 'Home', 'Utensils', 'Car', 'Heart', 'Book', 'Gift', 'Film', 'Wifi', 'Smartphone', 'Briefcase', 'Globe', 'Music', 'Star',
    ];
    // Nomes de exemplo para categorias de despesa e receita
    const expenseNames = [
      'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Serviços', 'Pets', 'Viagem', 'Contas', 'Outros'
    ];
    const incomeNames = [
      'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Reembolso', 'Prêmios', 'Outros'
    ];

    // Gera categorias de despesa
    const expenseCategoriesSeed = categoryIcons.slice(0, expenseNames.length).map((icon, idx) => ({
      name: expenseNames[idx],
      type: 'expense',
      color: categoryColors[idx % categoryColors.length],
      icon,
      userId: user.id
    }));
    // Gera categorias de receita
    const incomeCategoriesSeed = categoryIcons.slice(0, incomeNames.length).map((icon, idx) => ({
      name: incomeNames[idx],
      type: 'income',
      color: categoryColors[(idx + 5) % categoryColors.length],
      icon,
      userId: user.id
    }));

    // Cria categorias padrão (apenas as novas)
    const categories = await prisma.category.createMany({
      data: [
        ...incomeCategoriesSeed,
        ...expenseCategoriesSeed
      ]
    });

    console.log('✅ Categorias criadas:', categories.count);

    // Criar cartões de exemplo
    await prisma.card.createMany({
      data: [
        {
          name: 'Cartão Principal',
          lastFour: '1234',
          type: 'credit',
          brand: 'visa',
          color: '#1976D2',
          limit: 5000.00,
          userId: user.id
        },
        {
          name: 'Cartão Débito',
          lastFour: '5678',
          type: 'debit',
          brand: 'mastercard',
          color: '#FF6B35',
          userId: user.id
        }
      ]
    });

    console.log('✅ Cartões criados');

    // Criar metas de exemplo
    await prisma.goal.createMany({
      data: [
        {
          name: 'Viagem de Férias',
          targetAmount: 8000.00,
          currentAmount: 2000.00,
          targetDate: new Date('2025-12-31'),
          color: '#FF9800',
          icon: '✈️',
          userId: user.id
        },
        {
          name: 'Emergência',
          targetAmount: 15000.00,
          currentAmount: 5000.00,
          color: '#F44336',
          icon: '🚨',
          userId: user.id
        },
        {
          name: 'Novo Carro',
          targetAmount: 50000.00,
          currentAmount: 12000.00,
          targetDate: new Date('2026-06-30'),
          color: '#4CAF50',
          icon: '🚗',
          userId: user.id
        }
      ]
    });

    console.log('✅ Metas criadas');

    // Criar usuário premium de exemplo
    const premiumUser = await prisma.user.create({
      data: {
        name: 'Usuário Premium',
        email: 'premium@exemplo.com',
        password: hashedPassword,
        phone: '11888888888',
        isPremium: true,
        premiumPlan: 'yearly',
        premiumStartDate: new Date(),
        premiumEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
      }
    });

    // Criar assinatura premium ativa
    await prisma.subscription.create({
      data: {
        userId: premiumUser.id,
        plan: 'yearly',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        amount: 89.90,
        currency: 'BRL',
        paymentMethod: 'credit_card'
      }
    });

    console.log('✅ Usuário premium criado:', premiumUser.email);

    // Criar conta 'Carteira' para o usuário 
    await prisma.account.create({
      data: {
        name: 'Carteira',
        type: 'wallet',
        color: '#FFD700',
        icon: 'Wallet',
        balance: 0,
        includeInTotal: true,
        userId: user.id,
      }
    });

    // Criar conta 'Carteira' para o usuário premium
    await prisma.account.create({
      data: {
        name: 'Carteira',
        type: 'wallet',
        color: '#FFD700',
        icon: 'Wallet',
        balance: 0,
        includeInTotal: true,
        userId: premiumUser.id,
      }
    });

    console.log('✅ Contas criadas');

    console.log('🎉 Seed concluído com sucesso!');
    console.log('');
    console.log('� Usuários criados:');
    console.log('�📧 Email: usuario@exemplo.com');
    console.log('🔑 Senha: 123456');
    console.log('📊 Status: Usuário gratuito');
    console.log('');
    console.log('👑 Email: premium@exemplo.com');
    console.log('🔑 Senha: 123456');
    console.log('📊 Status: Usuário premium (plano anual)');
    console.log('');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
