const connection = require('../database');

const Event = {
  create: (eventData) => {
    return new Promise((resolve, reject) => {
      const { titulo, descricao, data, local, categoria, organizador_id } = eventData;
      const query = `INSERT INTO eventos (titulo, descricao, data, local, categoria, organizador_id) VALUES (?, ?, ?, ?, ?, ?)`;
      connection.query(query, [titulo, descricao, data, local, categoria, organizador_id], (err, results) => {
        if (err) return reject(err);
        resolve({ id: results.insertId, ...eventData });
      });
    });
  },

  findAll: (filters) => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT e.*, u.nome as organizador_nome FROM eventos e JOIN usuarios u ON e.organizador_id = u.id WHERE 1=1';
      const params = [];

      if (filters.categoria) {
        query += ' AND e.categoria = ?';
        params.push(filters.categoria);
      }
      if (filters.data) {
        query += ' AND DATE(e.data) = ?';
        params.push(filters.data);
      }

      connection.query(query, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM eventos WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  update: (id, eventData) => {
    return new Promise((resolve, reject) => {
      const { titulo, descricao, data, local, categoria } = eventData;
      const query = `UPDATE eventos SET titulo = ?, descricao = ?, data = ?, local = ?, categoria = ? WHERE id = ?`;
      connection.query(query, [titulo, descricao, data, local, categoria, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM eventos WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
};

module.exports = Event;
