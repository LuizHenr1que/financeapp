const prisma = require('../config/database');

class CardController {
  // Listar cartões do usuário
  async index(req, res) {
    try {
      const userId = req.user.id;

      const cards = await prisma.card.findMany({
        where: { userId },
        orderBy: { name: 'asc' }
      });

      res.json({ cards });
    } catch (error) {
      console.error('Erro ao listar cartões:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new CardController();
