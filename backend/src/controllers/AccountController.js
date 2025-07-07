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
}

module.exports = new AccountController();
