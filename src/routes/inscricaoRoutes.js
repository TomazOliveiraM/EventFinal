const express = require('express');
const router = express.Router();

// Importa o controller de inscrições
const inscricaoController = require('../controllers/inscricaoController');

// Importa middleware para verificar login do usuário
const { verificarToken, autorizar } = require('../middlewares/auth');

// Criar inscrição (apenas participantes)
router.post('/', verificarToken, autorizar('participante'), inscricaoController.inscrever);

// Listar inscrições do usuário logado (apenas participantes)
router.get('/me', verificarToken, autorizar('participante'), inscricaoController.listByUsuario);

// Cancelar inscrição em evento (apenas participantes)
router.delete('/:id', verificarToken, autorizar('participante'), inscricaoController.cancelar);

// [PAINEL DO ORGANIZADOR] - Rota para um organizador ver os inscritos em seu evento
router.get('/evento/:eventId/inscritos', verificarToken, autorizar('organizador', 'admin'), inscricaoController.listByEvent);

module.exports = router;
