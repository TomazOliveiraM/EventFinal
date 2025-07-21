const request = require('supertest');
const app = require('../app.js');
const connection = require('../database');
const { createUserAndLogin } = require('./helpers');

let organizadorToken;
let participanteToken;
let eventoId;
let inscricaoId;

beforeAll(async () => {
  // Limpar tabelas na ordem correta para evitar erros de chave estrangeira
  await connection.query('DELETE FROM comentarios');
  await connection.query('DELETE FROM inscricoes');
  await connection.query('DELETE FROM eventos');
  await connection.query('DELETE FROM usuarios');

  const organizador = await createUserAndLogin('Organizador Inscrição', 'org.insc@test.com', 'organizador');
  organizadorToken = organizador.token;

  const participante = await createUserAndLogin('Participante Inscrição', 'part.insc@test.com', 'participante');
  participanteToken = participante.token;

  // Organizador cria um evento para os testes
  const eventoResponse = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${organizadorToken}`)
    .send({
      titulo: 'Evento para Inscrição',
      descricao: 'Evento para testar inscrições.',
      data: '2025-12-01T19:00:00',
      local: 'Online',
      categoria: 'Testes',
    });
  eventoId = eventoResponse.body.event.id;
});

afterAll(async () => {
  await connection.end();
});

describe('Subscription Routes (/api/inscricoes)', () => {
  it('POST / - deve inscrever um participante em um evento com sucesso', async () => {
    const response = await request(app)
      .post('/api/inscricoes')
      .set('Authorization', `Bearer ${participanteToken}`)
      .send({ evento_id: eventoId });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Inscrição realizada com sucesso!');
    expect(response.body.inscricao).toHaveProperty('id');
    inscricaoId = response.body.inscricao.id; // Salva o ID da inscrição para o teste de cancelamento
  });

  it('POST / - deve retornar erro 409 ao tentar se inscrever no mesmo evento duas vezes', async () => {
    const response = await request(app)
      .post('/api/inscricoes')
      .set('Authorization', `Bearer ${participanteToken}`)
      .send({ evento_id: eventoId });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error', 'Você já está inscrito neste evento.');
  });

  it('GET /me - deve listar os eventos em que o participante está inscrito', async () => {
    const response = await request(app)
      .get('/api/inscricoes/me')
      .set('Authorization', `Bearer ${participanteToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].titulo).toBe('Evento para Inscrição');
  });

  it('GET /evento/:eventId/inscritos - deve permitir que o organizador veja os inscritos', async () => {
    const response = await request(app)
      .get(`/api/inscricoes/evento/${eventoId}/inscritos`)
      .set('Authorization', `Bearer ${organizadorToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].email).toBe('part.insc@test.com');
  });

  it('GET /evento/:eventId/inscritos - deve impedir que um participante veja os inscritos', async () => {
    const response = await request(app)
      .get(`/api/inscricoes/evento/${eventoId}/inscritos`)
      .set('Authorization', `Bearer ${participanteToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Acesso negado');
  });

  it('DELETE /:id - deve cancelar a inscrição com sucesso', async () => {
    const response = await request(app)
      .delete(`/api/inscricoes/${inscricaoId}`)
      .set('Authorization', `Bearer ${participanteToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Inscrição cancelada com sucesso.');
  });
});