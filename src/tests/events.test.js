const request = require('supertest');
const app = require('../app'); // Importa o app Express
const connection = require('../database'); // Importa a conexão para fechar no final

// Hook para fechar a conexão com o banco após todos os testes do arquivo
afterAll(() => {
  connection.end();
});

describe('Testes de API para Eventos', () => {
  
  // Teste para a rota GET /api/events
  it('GET /api/events -> deve retornar uma lista de eventos (array)', async () => {
    const response = await request(app)
      .get('/api/events')
      .expect('Content-Type', /json/)
      .expect(200);

    // Espera-se que o corpo da resposta seja um array
    expect(Array.isArray(response.body)).toBe(true);
  });

});