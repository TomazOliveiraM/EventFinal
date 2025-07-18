const connection = require('../database');

const Comentario = {
    create: (data) => {
        return new Promise((resolve, reject) => {
            const { texto, avaliacao, usuario_id, evento_id } = data;
            const query = 'INSERT INTO comentarios (texto, avaliacao, usuario_id, evento_id) VALUES (?, ?, ?, ?)';
            connection.query(query, [texto, avaliacao, usuario_id, evento_id], (err, results) => {
                if (err) return reject(err);
                resolve({ id: results.insertId, ...data });
            });
        });
    },

    findByEventId: (evento_id) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT c.*, u.nome as usuario_nome 
                FROM comentarios c 
                JOIN usuarios u ON c.usuario_id = u.id 
                WHERE c.evento_id = ? 
                ORDER BY c.data DESC
            `;
            connection.query(query, [evento_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
};

module.exports = Comentario;