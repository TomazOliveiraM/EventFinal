const request = require('supertest');
const app = require('../app.js'); // Importa sua aplicação Express
const connection = require('../database');

// Limpa a tabela de usuários antes de cada teste para garantir um ambiente limpo
beforeAll(async () => {
  await connection.query('DELETE FROM usuarios');
});

// Fecha a conexão com o banco após todos os testes
afterAll(async () => {
  await connection.end();
});

describe('Testes das Rotas de Usuário (/api/users)', () => {

  // Teste para o registro de um novo usuário com sucesso
  it('POST /register - deve registrar um novo usuário com sucesso', async () => {
    const novoUsuario = {
      nome: 'Usuário Teste',
      email: 'teste@exemplo.com',
      senha: 'senha123',
      tipo: 'participante'
    };

    const response = await request(app)
      .post('/api/users/register')
      .send(novoUsuario);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message', 'Usuário registrado com sucesso!');
  });

  // Teste para evitar registro de email duplicado
  it('POST /register - deve retornar erro 409 para email duplicado', async () => {
    const usuarioDuplicado = {
      nome: 'Outro Usuário',
      email: 'teste@exemplo.com', // Mesmo email do teste anterior
      senha: 'outrasenha'
    };

    const response = await request(app)
      .post('/api/users/register')
      .send(usuarioDuplicado);

    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty('error', 'Este email já está em uso.');
  });
});