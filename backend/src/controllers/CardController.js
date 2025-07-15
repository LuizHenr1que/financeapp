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

  // Criar novo cartão
  async create(req, res) {
    try {
      const userId = req.user.id;
      const { name, type, icon, limit, closingDay, dueDay } = req.body;
      if (!name || !type) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
      }
      const card = await prisma.card.create({
        data: {
          userId,
          name,
          type,
          icon: icon || null,
          limit: limit ? Number(limit) : null,
          closingDay: closingDay !== undefined ? closingDay : null,
          dueDay: dueDay !== undefined ? dueDay : null,
        }
      });
      res.status(201).json({ card });
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new CardController();
