const connection = require('../database');

const Inscricao = {
  create: ({ usuario_id, evento_id }) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO inscricoes (usuario_id, evento_id) VALUES (?, ?)';
      connection.query(query, [usuario_id, evento_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  findByUser: (usuario_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.* FROM eventos e
        JOIN inscricoes i ON e.id = i.evento_id
        WHERE i.usuario_id = ?
      `;
      connection.query(query, [usuario_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  findByEvent: (evento_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.id, u.nome, u.email FROM usuarios u
        JOIN inscricoes i ON u.id = i.usuario_id
        WHERE i.evento_id = ?
      `;
      connection.query(query, [evento_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  delete: ({ usuario_id, evento_id }) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM inscricoes WHERE usuario_id = ? AND evento_id = ?';
      connection.query(query, [usuario_id, evento_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
};

module.exports = Inscricao;
