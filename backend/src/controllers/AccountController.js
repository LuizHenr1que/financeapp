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
      const { name, type, color, icon, balance, includeInTotal } = req.body;
      // Cria a conta solicitada
      const account = await prisma.account.create({
        data: {
          name,
          type,
          color,
          icon,
          balance: balance !== undefined ? balance : 0,
          includeInTotal: includeInTotal !== undefined ? includeInTotal : true,
          userId,
        },
      });

      // Cria categorias padrão apenas se não existirem para o usuário
      const existingCategories = await prisma.category.findFirst({ where: { userId } });
      if (!existingCategories) {
        const mainCategories = [
          { name: 'Alimentação', type: 'expense', color: '#F44336', icon: 'Utensils' },
          { name: 'Transporte', type: 'expense', color: '#FF5722', icon: 'Car' },
          { name: 'Moradia', type: 'expense', color: '#795548', icon: 'Home' },
          { name: 'Saúde', type: 'expense', color: '#E91E63', icon: 'Heart' },
          { name: 'Educação', type: 'expense', color: '#3F51B5', icon: 'Book' },
          { name: 'Lazer', type: 'expense', color: '#9E9E9E', icon: 'Gift' },
          { name: 'Compras', type: 'expense', color: '#607D8B', icon: 'ShoppingCart' },
          { name: 'Serviços', type: 'expense', color: '#00BCD4', icon: 'Briefcase' },
          { name: 'Salário', type: 'income', color: '#4CAF50', icon: 'DollarSign' },
          { name: 'Freelance', type: 'income', color: '#2196F3', icon: 'Laptop' },
          { name: 'Investimentos', type: 'income', color: '#FF9800', icon: 'PiggyBank' },
          { name: 'Vendas', type: 'income', color: '#9C27B0', icon: 'ShoppingBag' },
        ];
        await prisma.category.createMany({
          data: mainCategories.map(cat => ({
            ...cat,
            userId,
            accountId: account.id
          }))
        });
      }

      res.status(201).json({ account, message: 'Conta cadastrada com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      res.status(500).json({ error: 'Erro ao criar conta' });
    }
  }

  // Editar conta
  async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { name, type, color, icon, balance, includeInTotal } = req.body;
      // Só permite editar contas do próprio usuário
      const account = await prisma.account.findFirst({ where: { id, userId } });
      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }
      const updated = await prisma.account.update({
        where: { id },
        data: { name, type, color, icon, balance, includeInTotal },
      });
      res.json({ account: updated, message: 'Conta editada com sucesso!' });
    } catch (error) {
      console.error('Erro ao editar conta:', error);
      res.status(500).json({ error: 'Erro ao editar conta' });
    }
  }

  // Excluir conta
  async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      // Só permite excluir contas do próprio usuário
      const account = await prisma.account.findFirst({ where: { id, userId } });
      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }
      await prisma.account.delete({ where: { id } });
      res.json({ message: 'Conta excluída com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      res.status(500).json({ error: 'Erro ao excluir conta' });
    }
  }
}

module.exports = new AccountController();
