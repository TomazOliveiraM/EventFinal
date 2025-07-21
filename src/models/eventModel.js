const connection = require('../database');

const Event = {
  create: async (eventData) => {
    const { titulo, descricao, data, local, categoria, organizador_id } = eventData;
    const query = `INSERT INTO eventos (titulo, descricao, data, local, categoria, organizador_id) VALUES (?, ?, ?, ?, ?, ?)`;
    const [results] = await connection.query(query, [titulo, descricao, data, local, categoria, organizador_id]);
    return { id: results.insertId, ...eventData };
  },

  findAll: async (filters) => {
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

    const [results] = await connection.query(query, params);
    return results;
  },

  findById: async (id) => {
    const [results] = await connection.query('SELECT * FROM eventos WHERE id = ?', [id]);
    return results[0];
  },

  update: async (id, eventData) => {
    const { titulo, descricao, data, local, categoria } = eventData;
    const query = `UPDATE eventos SET titulo = ?, descricao = ?, data = ?, local = ?, categoria = ? WHERE id = ?`;
    const [results] = await connection.query(query, [titulo, descricao, data, local, categoria, id]);
    return results;
  },

  delete: async (id) => {
    const [results] = await connection.query('DELETE FROM eventos WHERE id = ?', [id]);
    return results;
  }
};

module.exports = Event;
