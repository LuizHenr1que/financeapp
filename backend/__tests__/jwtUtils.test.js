const jwt = require('jsonwebtoken');

describe('JWT Utils', () => {
  const mockUserId = 123;
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  describe('generateToken', () => {
    it('deve gerar um token JWT válido', () => {
      const payload = { userId: mockUserId };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verificar se o token pode ser decodificado
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(mockUserId);
    });

    it('deve incluir expiração no token', () => {
      const payload = { userId: mockUserId };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('verifyToken', () => {
    it('deve verificar um token válido', () => {
      const payload = { userId: mockUserId };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.userId).toBe(mockUserId);
    });

    it('deve lançar erro para token inválido', () => {
      const invalidToken = 'token-invalido';
      
      expect(() => {
        jwt.verify(invalidToken, process.env.JWT_SECRET);
      }).toThrow();
    });

    it('deve lançar erro para token expirado', () => {
      // Criar token com expiração muito curta
      const expiredToken = jwt.sign(
        { userId: mockUserId },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );
      
      expect(() => {
        jwt.verify(expiredToken, process.env.JWT_SECRET);
      }).toThrow('jwt expired');
    });
  });
});
