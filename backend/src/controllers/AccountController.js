const prisma = require('../config/database');

class AccountController {
  // Listar contas do usuário
  async index(req, res) {
    try {
      const userId = req.user.id;

      const accounts = await prisma.account.findMany({
        where: { userId },
        orderBy: { name: 'asc' }
      });

      res.json({ accounts });
    } catch (error) {
      console.error('Erro ao listar contas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar nova conta e cartão padrão
  async create(req, res) {
    try {
      const userId = req.user.id;
      const { name, type, color, icon, balance } = req.body;
      // Cria a conta
      const account = await prisma.account.create({
        data: {
          name,
          type,
          color,
          icon,
          balance: balance !== undefined ? balance : 0,
          userId,
        },
      });
      // Cria o cartão padrão vinculado à conta
      await prisma.card.create({
        data: {
          name: 'Cartão',
          lastFour: '0000',
          type: 'credit',
          brand: 'default',
          color: color || null,
          limit: 0,
          userId,
        },
      });
      // Cria categorias principais para a conta
      const mainCategories = [
        { name: 'Alimentação', type: 'expense', color: '#F44336', icon: '🍽️' },
        { name: 'Transporte', type: 'expense', color: '#FF5722', icon: '🚗' },
        { name: 'Moradia', type: 'expense', color: '#795548', icon: '🏠' },
        { name: 'Saúde', type: 'expense', color: '#E91E63', icon: '🏥' },
        { name: 'Educação', type: 'expense', color: '#3F51B5', icon: '📚' },
        { name: 'Lazer', type: 'expense', color: '#9E9E9E', icon: '🎉' },
        { name: 'Compras', type: 'expense', color: '#607D8B', icon: '🛒' },
        { name: 'Serviços', type: 'expense', color: '#00BCD4', icon: '🔧' },
        { name: 'Salário', type: 'income', color: '#4CAF50', icon: '💰' },
        { name: 'Freelance', type: 'income', color: '#2196F3', icon: '💻' },
        { name: 'Investimentos', type: 'income', color: '#FF9800', icon: '📈' },
        { name: 'Vendas', type: 'income', color: '#9C27B0', icon: '🛍️' },
      ];
      await prisma.category.createMany({
        data: mainCategories.map(cat => ({
          ...cat,
          userId,
          accountId: account.id
        }))
      });
      res.status(201).json({ account, message: 'Conta, cartão e categorias principais criados com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      res.status(500).json({ error: 'Erro ao criar conta' });
    }
  }
}

module.exports = new AccountController();
