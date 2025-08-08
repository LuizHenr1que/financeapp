const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../src/utils/jwt');

describe('JWT Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-key',
      JWT_EXPIRES_IN: '7d'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    it('deve gerar um token válido com userId', () => {
      const userId = 123;
      const token = generateToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verificar se o token contém as informações corretas
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('deve usar expiração padrão quando JWT_EXPIRES_IN não está definido', () => {
      delete process.env.JWT_EXPIRES_IN;
      
      const userId = 456;
      const token = generateToken(userId);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
      
      // Verificar se a expiração foi definida (7 dias = 604800 segundos)
      const expectedExpiration = decoded.iat + 604800;
      expect(decoded.exp).toBe(expectedExpiration);
    });

    it('deve usar expiração customizada quando JWT_EXPIRES_IN está definido', () => {
      process.env.JWT_EXPIRES_IN = '1h';
      
      const userId = 789;
      const token = generateToken(userId);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
      
      // Verificar se a expiração foi definida (1 hora = 3600 segundos)
      const expectedExpiration = decoded.iat + 3600;
      expect(decoded.exp).toBe(expectedExpiration);
    });

    it('deve gerar tokens diferentes para userIds diferentes', () => {
      const token1 = generateToken(1);
      const token2 = generateToken(2);

      expect(token1).not.toBe(token2);

      const decoded1 = jwt.verify(token1, process.env.JWT_SECRET);
      const decoded2 = jwt.verify(token2, process.env.JWT_SECRET);

      expect(decoded1.userId).toBe(1);
      expect(decoded2.userId).toBe(2);
    });
  });

  describe('verifyToken', () => {
    it('deve verificar e decodificar um token válido', () => {
      const userId = 123;
      const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(userId);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('deve lançar erro para token inválido', () => {
      const invalidToken = 'token.invalido.aqui';

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('deve lançar erro para token expirado', () => {
      const userId = 123;
      const expiredToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Token já expirado
      );

      expect(() => verifyToken(expiredToken)).toThrow('jwt expired');
    });

    it('deve lançar erro para token com secret incorreto', () => {
      const userId = 123;
      const token = jwt.sign(
        { userId },
        'secret-diferente',
        { expiresIn: '1h' }
      );

      expect(() => verifyToken(token)).toThrow('invalid signature');
    });

    it('deve lançar erro para token malformado', () => {
      const malformedToken = 'nao.eh.um.jwt';

      expect(() => verifyToken(malformedToken)).toThrow();
    });

    it('deve verificar token gerado pela função generateToken', () => {
      const userId = 456;
      const token = generateToken(userId);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(userId);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('Integração generateToken e verifyToken', () => {
    it('deve funcionar em conjunto corretamente', () => {
      const userId = 999;
      
      // Gerar token
      const token = generateToken(userId);
      expect(token).toBeDefined();
      
      // Verificar token
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(userId);
    });

    it('deve preservar userId através do processo de geração e verificação', () => {
      const testUserIds = [1, 42, 123456, 999999];
      
      testUserIds.forEach(userId => {
        const token = generateToken(userId);
        const decoded = verifyToken(token);
        expect(decoded.userId).toBe(userId);
      });
    });
  });
});
