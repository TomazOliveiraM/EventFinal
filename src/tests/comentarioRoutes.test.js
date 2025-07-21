const request = require('supertest');
const app = require('../app.js');
const connection = require('../database');
const { createUserAndLogin } = require('./helpers');

let participanteToken;
let eventoId;

beforeAll(async () => {
  // Limpar tabelas
  await connection.query('DELETE FROM comentarios');
  await connection.query('DELETE FROM inscricoes');
  await connection.query('DELETE FROM eventos');
  await connection.query('DELETE FROM usuarios');

  // Usa o helper para criar e logar com os usuários
  const organizador = await createUserAndLogin('Organizador Comentario', 'org.coment@test.com', 'organizador');
  const organizadorToken = organizador.token;

  const participante = await createUserAndLogin('Participante Comentario', 'part.coment@test.com', 'participante');
  participanteToken = participante.token;

  // Organizador cria um evento
  const eventoResponse = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${organizadorToken}`)
    .send({
      titulo: 'Evento para Comentar',
      descricao: 'Evento para testar comentários.',
      data: '2026-01-01T19:00:00',
      local: 'Online',
      categoria: 'Testes',
    });
  eventoId = eventoResponse.body.event.id;
});

afterAll(async () => {
  await connection.end();
});

describe('Comment Routes (/api/comentarios)', () => {
  it('POST / - deve criar um comentário em um evento com sucesso', async () => {
    const response = await request(app)
      .post('/api/comentarios')
      .set('Authorization', `Bearer ${participanteToken}`)
      .send({
        evento_id: eventoId,
        texto: 'Este é um comentário de teste!',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Comentário adicionado com sucesso');
    expect(response.body.comentario).toHaveProperty('id');
    expect(response.body.comentario.texto).toBe('Este é um comentário de teste!');
  });

  it('GET /evento/:evento_id - deve listar os comentários de um evento', async () => {
    const response = await request(app).get(`/api/comentarios/evento/${eventoId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toHaveProperty('usuario_nome', 'Participante Comentario');
    expect(response.body[0].texto).toBe('Este é um comentário de teste!');
  });
});