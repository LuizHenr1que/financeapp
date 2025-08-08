// Teste simples para verificar rotas básicas
const request = require('supertest');
const app = require('../src/app');

describe('API Health Check', () => {
  it('deve responder com status OK no endpoint de health', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });

  it('deve retornar 404 para rotas não encontradas', async () => {
    const response = await request(app)
      .get('/api/rota-inexistente')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Rota não encontrada');
    expect(response.body).toHaveProperty('message');
  });
});
