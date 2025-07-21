const connection = require('../database');

const Inscricao = {
  create: async (inscricaoData) => {
    const { evento_id, participante_id } = inscricaoData;
    const sql = 'INSERT INTO inscricoes (evento_id, participante_id) VALUES (?, ?)';
    const [results] = await connection.query(sql, [evento_id, participante_id]);
    return { id: results.insertId, ...inscricaoData };
  },

  findByUserAndEvent: async (participante_id, evento_id) => {
    const sql = 'SELECT * FROM inscricoes WHERE participante_id = ? AND evento_id = ?';
    const [results] = await connection.query(sql, [participante_id, evento_id]);
    return results[0];
  },

  delete: async (id, participante_id) => {
    // Garante que o usuário só pode deletar a própria inscrição
    const sql = 'DELETE FROM inscricoes WHERE id = ? AND participante_id = ?';
    const [results] = await connection.query(sql, [id, participante_id]);
    return results;
  },

  findByUser: async (participante_id) => {
    const sql = `
      SELECT e.*, i.id as inscricao_id
      FROM eventos e
      JOIN inscricoes i ON e.id = i.evento_id
      WHERE i.participante_id = ?`;
    const [results] = await connection.query(sql, [participante_id]);
    return results;
  },

  findByEvent: async (evento_id) => {
    const sql = 'SELECT u.id, u.nome, u.email FROM inscricoes i JOIN usuarios u ON i.participante_id = u.id WHERE i.evento_id = ?';
    const [results] = await connection.query(sql, [evento_id]);
    return results;
  }
};

module.exports = Inscricao;