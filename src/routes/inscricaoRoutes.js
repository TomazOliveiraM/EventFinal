const express = require('express');
const router = express.Router();

// Importa o controller de inscrições
const inscricaoController = require('../controllers/inscricaoController');

// Importa middleware para verificar login do usuário
const { verificarToken, autorizar } = require('../middlewares/auth');

// Criar inscrição (usuário precisa estar logado)
router.post('/', verificarToken, inscricaoController.create);

// Listar inscrições do usuário logado
router.get('/me', verificarToken, inscricaoController.listByUsuario);

// Cancelar inscrição em evento
router.delete('/', verificarToken, inscricaoController.cancel);

// [PAINEL DO ORGANIZADOR] - Rota para um organizador ver os inscritos em seu evento
router.get('/evento/:eventId/inscritos', verificarToken, autorizar('organizador', 'admin'), inscricaoController.listByEvent);

module.exports = router;
