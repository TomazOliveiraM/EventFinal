const Comentario = require('../models/comentarioModel');

exports.create = async (req, res) => {
    try {
        const data = {
            ...req.body,
            usuario_id: req.usuario.id // ID do usuário logado (vem do token)
        };

        const novoComentario = await Comentario.create(data);
        res.status(201).json({ message: "Comentário adicionado com sucesso", comentario: novoComentario });

    } catch (err) {
        res.status(500).json({ error: 'Erro ao adicionar comentário', details: err.message });
    }
};

exports.listByEvent = async (req, res) => {
    try {
        const { evento_id } = req.params;
        const comentarios = await Comentario.findByEventId(evento_id);
        res.json(comentarios);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao listar comentários', details: err.message });
    }
};