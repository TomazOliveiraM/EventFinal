const express = require('express');
const router = express.Router();

// Importa o controller com as funções para eventos
const eventController = require('../controllers/eventController');

// Middleware de autenticação
const { verificarToken, autorizar } = require('../middlewares/auth');

// Criar novo evento (apenas usuários do tipo "organizador")
router.post('/', verificarToken, autorizar('organizador'), eventController.create);

// Listar todos os eventos disponíveis
router.get('/', eventController.listAll);

// Listar evento específico por ID
router.get('/:id', eventController.getById);

// Atualizar evento (apenas o organizador pode)
router.put('/:id', verificarToken, autorizar('organizador', 'admin'), eventController.update);

// Deletar evento
router.delete('/:id', verificarToken, autorizar('organizador', 'admin'), eventController.delete);

module.exports = router;
