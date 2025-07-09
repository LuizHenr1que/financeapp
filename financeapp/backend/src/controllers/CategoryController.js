// Ao criar categoria
async function createCategory(req, res) {
  try {
    const { name, color, icon, type } = req.body;
    // Pegue o userId do usuário autenticado (ajuste conforme seu middleware de auth)
    const userId = req.user?.id || req.body.userId;
    // Validação simples
    if (!name || !color || !icon || !type || !userId) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    // Cria categoria
    const category = await prisma.category.create({
      data: { name, color, icon, type, userId },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
}

// Ao editar categoria
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, color, icon, type } = req.body;
    // Pegue o userId do usuário autenticado (ajuste conforme seu middleware de auth)
    const userId = req.user?.id || req.body.userId;
    // Validação simples
    if (!name || !color || !icon || !type || !userId) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    const category = await prisma.category.update({
      where: { id },
      data: { name, color, icon, type, userId },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar categoria.' });
  }
}

module.exports = {
  createCategory,
  updateCategory,
  // ...adicione outras funções se existirem...
};