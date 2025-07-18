const Inscricao = require('../models/inscricaoModel');
const Event = require('../models/eventModel');

// Criar uma nova inscrição no evento
exports.create = async (req, res) => {
  try {
    const { evento_id } = req.body;
    const usuario_id = req.usuario.id;
    await Inscricao.create({ usuario_id, evento_id });
    res.status(201).json({ message: 'Inscrição realizada com sucesso' });
  } catch (err) {
    // Trata erro de inscrição duplicada
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Você já está inscrito neste evento.' });
    }
    res.status(500).json({ error: 'Erro ao se inscrever no evento', details: err.message });
  }
};

// Listar todas as inscrições do usuário logado
exports.listByUsuario = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const eventos = await Inscricao.findByUser(usuario_id);
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar inscrições', details: err.message });
  }
};

// Cancelar inscrição de um usuário em um evento
exports.cancel = async (req, res) => {
  try {
    const { evento_id } = req.body;
    const usuario_id = req.usuario.id;
    await Inscricao.delete({ usuario_id, evento_id });
    res.json({ message: 'Inscrição cancelada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cancelar inscrição', details: err.message });
  }
};

// [PAINEL DO ORGANIZADOR] - Listar usuários inscritos em um evento específico
exports.listByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const evento = await Event.findById(eventId);

    // Verifica se o evento existe e se o usuário logado é o organizador ou um admin
    if (!evento) return res.status(404).json({ error: 'Evento não encontrado.' });
    if (req.usuario.tipo !== 'admin' && evento.organizador_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado. Você não é o organizador deste evento.' });
    }

    const inscritos = await Inscricao.findByEvent(eventId);
    res.json(inscritos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar inscritos no evento.', details: err.message });
  }
};
