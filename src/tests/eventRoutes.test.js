const request = require('supertest');
const app = require('../app.js');
const connection = require('../database');
const { createUserAndLogin } = require('./helpers'); // Importa o helper

let organizadorToken;
let adminToken;
let participanteToken;
let organizadorId;
let participanteId;
let eventoId;

beforeAll(async () => {
  // Limpar tabelas
  await connection.query('DELETE FROM comentarios');
  await connection.query('DELETE FROM inscricoes');
  await connection.query('DELETE FROM eventos');
  await connection.query('DELETE FROM usuarios');

  // Usa o helper para criar e logar com os usuários
  const admin = await createUserAndLogin('Admin Teste', 'admin@test.com', 'admin');
  adminToken = admin.token;

  const organizador = await createUserAndLogin('Organizador Teste', 'organizador@test.com', 'organizador');
  organizadorToken = organizador.token;
  organizadorId = organizador.id;

  const participante = await createUserAndLogin('Participante Teste', 'participante@test.com', 'participante');
  participanteToken = participante.token;
  participanteId = participante.id;
});

afterAll(async () => {
  await connection.end();
});

describe('Event Routes', () => {
  it('POST /api/events - deve criar um evento com sucesso (como organizador)', async () => {
    const response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizadorToken}`)
      .send({
        titulo: 'Evento de Teste',
        descricao: 'Descrição do evento de teste.',
        data: '2025-10-20T19:00:00',
        local: 'Online',
        categoria: 'Tecnologia',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Evento criado com sucesso');
    expect(response.body.event).toHaveProperty('id');
    eventoId = response.body.event.id; // Salva o ID para outros testes
  });

  it('POST /api/events - deve falhar ao tentar criar um evento (como participante)', async () => {
    const response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${participanteToken}`)
      .send({
        titulo: 'Evento Falho',
        data: '2025-11-20T19:00:00',
        local: 'Online',
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Acesso negado');
  });

  it('GET /api/events - deve listar todos os eventos', async () => {
    const response = await request(app).get('/api/events');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /api/events/:id - deve retornar um evento específico', async () => {
    const response = await request(app).get(`/api/events/${eventoId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(eventoId);
    expect(response.body.titulo).toBe('Evento de Teste');
  });

  it('PUT /api/events/:id - deve atualizar um evento com sucesso (como organizador)', async () => {
    const response = await request(app)
      .put(`/api/events/${eventoId}`)
      .set('Authorization', `Bearer ${organizadorToken}`)
      .send({
        titulo: 'Evento de Teste Atualizado',
        descricao: 'Descrição atualizada.',
        data: '2025-10-21T20:00:00',
        local: 'Presencial',
        categoria: 'Networking',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Evento atualizado com sucesso');
  });

  it('DELETE /api/events/:id - deve falhar ao tentar deletar um evento (como participante)', async () => {
    const response = await request(app)
      .delete(`/api/events/${eventoId}`)
      .set('Authorization', `Bearer ${participanteToken}`);

    expect(response.status).toBe(403);
  });

  it('DELETE /api/events/:id - deve deletar um evento com sucesso (como organizador)', async () => {
    const response = await request(app).delete(`/api/events/${eventoId}`).set('Authorization', `Bearer ${organizadorToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Evento removido com sucesso');
  });

  it('GET /api/events/:id/inscricoes - deve listar as inscrições de um evento (como organizador)', async () => {
    // 1. Cria um novo evento para o teste
    const eventRes = await request(app).post('/api/events').set('Authorization', `Bearer ${organizadorToken}`).send({
      titulo: 'Evento com Inscrições', data: '2026-01-01T10:00:00', local: 'Online'
    });
    const newEventId = eventRes.body.event.id;

    // 2. Inscreve o participante no evento
    await request(app).post('/api/inscricoes').set('Authorization', `Bearer ${participanteToken}`).send({ evento_id: newEventId });

    // 3. Tenta listar as inscrições como o organizador do evento
    const response = await request(app)
      .get(`/api/events/${newEventId}/inscricoes`)
      .set('Authorization', `Bearer ${organizadorToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].usuario_id).toBe(participanteId);
  });
});