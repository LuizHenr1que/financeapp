const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');

// Importar o mock do database
const prisma = require('../src/config/database');

describe('AuthController', () => {
  describe('POST /api/auth/register', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deve registrar um novo usuário com sucesso', async () => {
      const userData = {
        name: 'Teste Usuario',
        email: 'teste@email.com',
        password: 'Senha123',
        phone: '11999999999'
      };

      // Mock para verificar se usuário não existe
      prisma.user.findUnique.mockResolvedValue(null);
      
      // Mock para criar usuário
      prisma.user.create.mockResolvedValue({
        id: 1,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        avatar: null,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mock para criar categorias padrão
      prisma.category.createMany.mockResolvedValue({ count: 4 });

      // Mock para criar conta padrão
      prisma.account.create.mockResolvedValue({
        id: 1,
        name: 'Carteira',
        type: 'wallet',
        balance: 0,
        userId: 1
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
    });

    it('deve retornar erro 400 quando email já existe', async () => {
      const userData = {
        name: 'Teste Usuario',
        email: 'existe@email.com',
        password: 'Senha123'
      };

      // Mock para usuário existente
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: userData.email
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email já está em uso');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando dados são inválidos', async () => {
      const invalidData = {
        name: '',
        email: 'email-invalido',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Dados inválidos');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deve fazer login com sucesso', async () => {
      const loginData = {
        email: 'teste@email.com',
        password: 'Senha123'
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 12);
      
      // Mock para encontrar usuário
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Teste Usuario',
        email: loginData.email,
        password: hashedPassword,
        phone: null,
        avatar: null,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email }
      });
    });

    it('deve retornar erro 401 quando email não existe', async () => {
      const loginData = {
        email: 'naoexiste@email.com',
        password: 'Senha123'
      };

      // Mock para usuário não encontrado
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Email ou senha incorretos');
    });

    it('deve retornar erro 401 quando senha está incorreta', async () => {
      const loginData = {
        email: 'teste@email.com',
        password: 'senhaerrada'
      };

      const hashedPassword = await bcrypt.hash('Senha123', 12);
      
      // Mock para encontrar usuário
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: loginData.email,
        password: hashedPassword
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Email ou senha incorretos');
    });

    it('deve retornar erro 400 quando dados são inválidos', async () => {
      const invalidData = {
        email: 'email-invalido',
        password: ''
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Dados inválidos');
      expect(response.body).toHaveProperty('details');
    });
  });
});
