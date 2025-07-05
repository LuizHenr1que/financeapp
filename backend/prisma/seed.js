const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes (cuidado em produção!)
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

    // Criar categorias padrão
    const categories = await prisma.category.createMany({
      data: [
        // Categorias de receita
        { name: 'Salário', type: 'income', color: '#4CAF50', icon: '💰', userId: user.id },
        { name: 'Freelance', type: 'income', color: '#2196F3', icon: '💻', userId: user.id },
        { name: 'Investimentos', type: 'income', color: '#FF9800', icon: '📈', userId: user.id },
        { name: 'Vendas', type: 'income', color: '#9C27B0', icon: '🛍️', userId: user.id },
        
        // Categorias de despesa
        { name: 'Alimentação', type: 'expense', color: '#F44336', icon: '🍽️', userId: user.id },
        { name: 'Transporte', type: 'expense', color: '#FF5722', icon: '🚗', userId: user.id },
        { name: 'Moradia', type: 'expense', color: '#795548', icon: '🏠', userId: user.id },
        { name: 'Saúde', type: 'expense', color: '#E91E63', icon: '🏥', userId: user.id },
        { name: 'Educação', type: 'expense', color: '#3F51B5', icon: '📚', userId: user.id },
        { name: 'Lazer', type: 'expense', color: '#9E9E9E', icon: '🎉', userId: user.id },
        { name: 'Compras', type: 'expense', color: '#607D8B', icon: '🛒', userId: user.id },
        { name: 'Serviços', type: 'expense', color: '#00BCD4', icon: '🔧', userId: user.id }
      ]
    });

    console.log('✅ Categorias criadas:', categories.count);

    // Criar contas padrão
    const checkingAccount = await prisma.account.create({
      data: {
        name: 'Conta Corrente',
        type: 'checking',
        balance: 2500.00,
        color: '#2196F3',
        icon: '🏦',
        userId: user.id
      }
    });

    const savingsAccount = await prisma.account.create({
      data: {
        name: 'Poupança',
        type: 'savings',
        balance: 10000.00,
        color: '#4CAF50',
        icon: '🐷',
        userId: user.id
      }
    });

    console.log('✅ Contas criadas');

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

    console.log('🎉 Seed concluído com sucesso!');
    console.log('📧 Email: usuario@exemplo.com');
    console.log('🔑 Senha: 123456');

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
