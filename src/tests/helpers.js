const request = require('supertest');
const app = require('../app.js');

/**
 * Cria um usuário e faz login, retornando o token e os dados do usuário.
 * @param {string} nome - Nome do usuário.
 * @param {string} email - Email do usuário.
 * @param {string} tipo - Tipo do usuário ('admin', 'organizador', 'participante').
 * @param {string} senha - Senha do usuário.
 * @returns {Promise<{id: number, token: string, tipo: string}>}
 */
const createUserAndLogin = async (nome, email, tipo = 'participante', senha = 'password123') => {
  // Registra o usuário
  await request(app)
    .post('/api/users/register')
    .send({ nome, email, senha, tipo });

  // Faz o login para obter o token e os dados do usuário
  const loginResponse = await request(app)
    .post('/api/users/login')
    .send({ email, senha });

  if (loginResponse.status !== 200) {
    throw new Error(`Falha no login para o usuário ${email}`);
  }

  return loginResponse.body.usuario ? { ...loginResponse.body.usuario, token: loginResponse.body.token } : null;
};

module.exports = { createUserAndLogin };