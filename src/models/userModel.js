const connection = require('../database');

const User = {
  create: async (userData) => {
    const { nome, email, senhaCriptografada, tipoUsuario, googleId, githubId } = userData;
    const sql = 'INSERT INTO usuarios (nome, email, senha, tipo, google_id, github_id) VALUES (?, ?, ?, ?, ?, ?)';
    const [results] = await connection.query(sql, [nome, email, senhaCriptografada || null, tipoUsuario, googleId || null, githubId || null]);
    return { id: results.insertId };
  },

  findByEmail: async (email) => {
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    const [results] = await connection.query(sql, [email]);
    return results[0];
  },

  findByGoogleId: async (googleId) => {
    const sql = 'SELECT * FROM usuarios WHERE google_id = ?';
    const [results] = await connection.query(sql, [googleId]);
    return results[0];
  },

  findByGithubId: async (githubId) => {
    const sql = 'SELECT * FROM usuarios WHERE github_id = ?';
    const [results] = await connection.query(sql, [githubId]);
    return results[0];
  },

  findById: async (id) => {
    // Retorna o usuário sem a senha
    const sql = 'SELECT id, nome, email, tipo, google_id, github_id FROM usuarios WHERE id = ?';
    const [results] = await connection.query(sql, [id]);
    return results[0];
  },
};

module.exports = User;
