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
      if (cards.length === 0) {
        console.log('Nenhum cartão cadastrado para o usuário:', userId);
      } else {
        console.log('Cartões cadastrados:', cards);
      }
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
      const { name, type, icon, limit, closingDay, dueDay, accountId } = req.body;
      if (!name || !type || !accountId) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios, incluindo conta de pagamento.' });
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
          accountId,
        }
      });
      res.status(201).json({ card });
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Editar cartão
  async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { name, type, icon, limit, closingDay, dueDay, accountId } = req.body;
      // Verifica se o cartão existe e pertence ao usuário
      const card = await prisma.card.findUnique({ where: { id } });
      if (!card || card.userId !== userId) {
        return res.status(404).json({ error: 'Cartão não encontrado' });
      }
      // Atualiza os campos permitidos
      const updatedCard = await prisma.card.update({
        where: { id },
        data: {
          name: name ?? card.name,
          type: type ?? card.type,
          icon: icon ?? card.icon,
          limit: limit !== undefined ? Number(limit) : card.limit,
          closingDay: closingDay !== undefined ? closingDay : card.closingDay,
          dueDay: dueDay !== undefined ? dueDay : card.dueDay,
          accountId: accountId ?? card.accountId,
        },
      });
      res.json({ message: 'Cartão atualizado com sucesso', card: updatedCard });
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new CardController();
