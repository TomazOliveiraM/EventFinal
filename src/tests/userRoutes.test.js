const request = require('supertest');
const app = require('../app.js'); // Importa o app express
const connection = require('../database');
const { createUserAndLogin } = require('./helpers'); // Importa o helper

// Limpa a tabela de usuários antes de cada teste para garantir um ambiente limpo
beforeEach(async () => {
  await connection.query('DELETE FROM usuarios');
});

// Fecha a conexão com o banco após todos os testes
afterAll(async () => {
  await connection.end();
});

describe('User Routes - Registro e Login', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'password123',
        tipo: 'participante',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Usuário registrado com sucesso!');
  });

  it('should fail to register if email is already in use', async () => {
    // Primeiro, cria um usuário para o email já existir
    await request(app)
      .post('/api/users/register')
      .send({
        nome: 'Existing User',
        email: 'test@example.com',
        senha: 'password123',
        tipo: 'participante',
      });

    // Agora, tenta registrar com o mesmo email
    const response = await request(app)
      .post('/api/users/register')
      .send({
        nome: 'Another User',
        email: 'test@example.com',
        senha: 'anotherpassword',
        tipo: 'participante',
      });

    expect(response.status).toBe(409); // 409 Conflict
    expect(response.body).toHaveProperty('error', 'Este email já está em uso.');
  });

  it('should fail to register with invalid data', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({ nome: 'Test' }); // Faltando email e senha

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  it('should login an existing user successfully and return a token', async () => {
    // Primeiro, registra o usuário que vamos tentar logar
    await request(app)
      .post('/api/users/register')
      .send({
        nome: 'Login User',
        email: 'login@test.com',
        senha: 'password123',
      });

    // Agora, tenta fazer o login
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: 'login@test.com', senha: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login realizado com sucesso');
    expect(response.body).toHaveProperty('token');
  });

  it('should fail to login with an incorrect password', async () => {
    // Primeiro, registra um usuário para o teste
    await request(app)
      .post('/api/users/register')
      .send({
        nome: 'Login User',
        email: 'login@test.com',
        senha: 'password123',
      });

    const response = await request(app)
      .post('/api/users/login')
      .send({ email: 'login@test.com', senha: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Email ou senha inválidos');
  });
});

describe('User Routes - Admin', () => {
  let adminToken;
  let participanteUser;

  beforeEach(async () => {
    // Cria um admin e um participante para os testes
    const admin = await createUserAndLogin('Admin User', 'admin@test.com', 'admin');
    adminToken = admin.token;

    participanteUser = await createUserAndLogin('Participante User', 'participante@test.com', 'participante');
  });

  it('GET /api/users - deve listar todos os usuários (como admin)', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Deve haver 2 usuários: admin e participante
    expect(response.body.length).toBe(2);
    expect(response.body[0]).not.toHaveProperty('senha'); // Garante que a senha não é exposta
  });

  it('DELETE /api/users/:id - deve deletar um usuário (como admin)', async () => {
    const response = await request(app)
      .delete(`/api/users/${participanteUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Usuário removido com sucesso.');

    // Verifica se o usuário foi realmente deletado
    const usersAfterDelete = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(usersAfterDelete.body.length).toBe(1);
    expect(usersAfterDelete.body[0].email).toBe('admin@test.com');
  });
});