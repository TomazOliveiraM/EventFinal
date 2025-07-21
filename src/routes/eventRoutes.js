const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Importa o controller com as funções para eventos
const eventController = require('../controllers/eventController');

// Middleware de autenticação
const { verificarToken, autorizar } = require('../middlewares/auth');

// Criar novo evento (apenas usuários do tipo "organizador")
router.post(
  '/',
  verificarToken,
  autorizar('organizador'),
  [
    body('titulo').notEmpty().withMessage('O título é obrigatório.'),
    body('data').isISO8601().toDate().withMessage('A data deve estar no formato AAAA-MM-DDTHH:MM:SS.'),
    body('local').notEmpty().withMessage('O local é obrigatório.'),
  ],
  eventController.create
);

// Listar todos os eventos disponíveis
router.get('/', eventController.listAll);

// Listar evento específico por ID
router.get('/:id', eventController.getById);

// Atualizar evento (apenas o organizador pode)
router.put('/:id', verificarToken, autorizar('organizador', 'admin'), eventController.update);

// Deletar evento
router.delete('/:id', verificarToken, autorizar('organizador', 'admin'), eventController.delete);

// Listar inscrições de um evento (apenas organizador do evento ou admin)
router.get('/:id/inscricoes', verificarToken, autorizar('organizador', 'admin'), eventController.listInscricoesByEvent);

module.exports = router;
