const prisma = require('../config/database');

class CategoryController {
  // Listar categorias do usuário
  async index(req, res) {
    try {
      const userId = req.user.id;

      const categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: 'asc' }
      });

      res.json({ categories });
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new CategoryController();
