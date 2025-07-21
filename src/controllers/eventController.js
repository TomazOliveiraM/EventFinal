const Event = require('../models/eventModel');
const Inscricao = require('../models/inscricaoModel'); // Adicionar import do model de Inscrição
const { validationResult } = require('express-validator');

// Criar novo evento
exports.create = async (req, res) => {
  try {
    // Verifica se houve erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      organizador_id: req.usuario.id // Pega do token
    };
    const newEvent = await Event.create(eventData);
    res.status(201).json({ message: 'Evento criado com sucesso', event: newEvent });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar evento', details: err.message });
  }
};

// Listar todos os eventos com filtros
exports.listAll = async (req, res) => {
  try {
    const filters = req.query; // Pega filtros da URL, ex: /api/events?categoria=tecnologia
    const events = await Event.findAll(filters);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar eventos', details: err.message });
  }
};

// Buscar evento por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar evento', details: err.message });
  }
};

// Atualizar evento
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    if (req.usuario.tipo !== 'admin' && event.organizador_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado. Você não é o organizador deste evento.' });
    }

    await Event.update(id, req.body);
    res.json({ message: 'Evento atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar evento', details: err.message });
  }
};

// Deletar evento
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    if (req.usuario.tipo !== 'admin' && event.organizador_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para deletar este evento.' });
    }

    await Event.delete(id);
    res.json({ message: 'Evento removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar evento', details: err.message });
  }
};

// Listar inscrições de um evento (para organizador ou admin)
exports.listInscricoesByEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    // Apenas o organizador do evento ou um admin pode ver as inscrições
    if (req.usuario.tipo !== 'admin' && event.organizador_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Acesso negado. Você não é o organizador deste evento.' });
    }

    // Assumindo que seu inscricaoModel tem um método findByEventId()
    const inscricoes = await Inscricao.findByEventId(id);
    res.status(200).json(inscricoes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar inscrições', details: err.message });
  }
};
