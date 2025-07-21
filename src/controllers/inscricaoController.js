const Inscricao = require('../models/inscricaoModel');
const Event = require('../models/eventModel');

exports.inscrever = async (req, res) => {
  try {
    const { evento_id } = req.body;
    const participante_id = req.usuario.id; // Do token JWT

    // 1. Verificar se o evento existe
    const evento = await Event.findById(evento_id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    // 2. Verificar se o usuário já está inscrito
    const inscricaoExistente = await Inscricao.findByUserAndEvent(participante_id, evento_id);
    if (inscricaoExistente) {
      return res.status(409).json({ error: 'Você já está inscrito neste evento.' });
    }

    // 3. Criar a inscrição
    const novaInscricao = await Inscricao.create({ evento_id, participante_id });
    res.status(201).json({ message: 'Inscrição realizada com sucesso!', inscricao: { id: novaInscricao.id, evento_id, participante_id } });

  } catch (err) {
    res.status(500).json({ error: 'Erro ao realizar inscrição', details: err.message });
  }
};

exports.cancelar = async (req, res) => {
  try {
    const { id } = req.params; // ID da inscrição
    const participante_id = req.usuario.id;

    const result = await Inscricao.delete(id, participante_id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inscrição não encontrada ou você não tem permissão para cancelá-la.' });
    }

    res.json({ message: 'Inscrição cancelada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cancelar inscrição', details: err.message });
  }
};

exports.listByUsuario = async (req, res) => {
  try {
    const participante_id = req.usuario.id;
    const inscricoes = await Inscricao.findByUser(participante_id);
    res.json(inscricoes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar inscrições do usuário', details: err.message });
  }
};

exports.listByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const evento = await Event.findById(eventId);

    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    if (req.usuario.tipo !== 'admin' && evento.organizador_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado. Você não é o organizador deste evento.' });
    }

    const inscritos = await Inscricao.findByEvent(eventId);
    res.json(inscritos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar inscritos do evento', details: err.message });
  }
};