const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listCategories() {
  try {
    console.log('📂 === CATEGORIAS NO BANCO DE DADOS ===\n');
    
    const users = await prisma.user.findMany({
      select: { id: true, email: true }
    });
    
    for (const user of users) {
      console.log(`👤 Usuário: ${user.email} (${user.id})`);
      console.log('📋 Categorias:');
      
      const categories = await prisma.category.findMany({
        where: { userId: user.id },
        orderBy: { name: 'asc' }
      });
      
      if (categories.length === 0) {
        console.log('   ❌ Nenhuma categoria encontrada');
      } else {
        categories.forEach((cat, index) => {
          console.log(`   ${index + 1}. ID: ${cat.id}`);
          console.log(`      Nome: ${cat.name}`);
          console.log(`      Tipo: ${cat.type}`);
          console.log(`      Cor: ${cat.color}`);
          console.log(`      Ícone: ${cat.icon}`);
          console.log('');
        });
      }
      console.log('─'.repeat(50));
    }
    
    console.log('\n🏦 === CARTÕES NO BANCO DE DADOS ===\n');
    
    for (const user of users) {
      console.log(`👤 Usuário: ${user.email} (${user.id})`);
      console.log('💳 Cartões:');
      
      const cards = await prisma.card.findMany({
        where: { userId: user.id },
        orderBy: { name: 'asc' }
      });
      
      if (cards.length === 0) {
        console.log('   ❌ Nenhum cartão encontrado');
      } else {
        cards.forEach((card, index) => {
          console.log(`   ${index + 1}. ID: ${card.id}`);
          console.log(`      Nome: ${card.name}`);
          console.log(`      Tipo: ${card.type}`);
          console.log(`      Marca: ${card.brand}`);
          console.log(`      Últimos 4 dígitos: ${card.lastFour}`);
          console.log('');
        });
      }
      
      console.log('🏦 Contas:');
      
      const accounts = await prisma.account.findMany({
        where: { userId: user.id },
        orderBy: { name: 'asc' }
      });
      
      if (accounts.length === 0) {
        console.log('   ❌ Nenhuma conta encontrada');
      } else {
        accounts.forEach((account, index) => {
          console.log(`   ${index + 1}. ID: ${account.id}`);
          console.log(`      Nome: ${account.name}`);
          console.log(`      Tipo: ${account.type}`);
          console.log(`      Saldo: R$ ${account.balance}`);
          console.log('');
        });
      }
      
      console.log('─'.repeat(50));
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listCategories();
