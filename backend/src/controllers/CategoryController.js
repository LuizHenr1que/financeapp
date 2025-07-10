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

  // Criar nova categoria
  async store(req, res) {
    try {
      const userId = req.user.id;
      const { name, type, color, icon, accountId } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
      }

      const category = await prisma.category.create({
        data: {
          name,
          type,
          color,
          icon,
          userId,
          accountId: accountId || null,
        },
      });

      res.status(201).json({ 
        message: 'Categoria criada com sucesso',
        category 
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Excluir categoria
  async destroy(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Garante que só exclui categoria do próprio usuário
      const category = await prisma.category.findUnique({
        where: { id },
      });
      if (!category || category.userId !== userId) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      await prisma.category.delete({ where: { id } });
      res.status(200).json({ 
        message: 'Categoria excluída com sucesso',
        success: true 
      });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar categoria
  async updateCategory(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { name, type, color, icon, accountId } = req.body;

      // Verifica se a categoria existe e pertence ao usuário
      const category = await prisma.category.findUnique({ where: { id } });
      if (!category || category.userId !== userId) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          name: name ?? category.name,
          type: type ?? category.type,
          color: color ?? category.color,
          icon: icon ?? category.icon,
          accountId: accountId !== undefined ? accountId : category.accountId,
        },
      });

      res.json({ 
        message: 'Categoria atualizada com sucesso',
        category: updatedCategory 
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new CategoryController();
