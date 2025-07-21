const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Importa o controller com as funções de cadastro, login etc.
const userController = require('../controllers/userController');

// Importa os middlewares de autenticação e autorização
const { verificarToken, autorizar } = require('../middlewares/auth');

// Rota para registrar novo usuário
router.post(
  '/register',
  [
    body('nome').isString().notEmpty().withMessage('O nome é obrigatório.'),
    body('email').isEmail().withMessage('Forneça um email válido.'),
    body('senha').isLength({ min: 6 }).withMessage('A senha precisa ter no mínimo 6 caracteres.'),
    body('tipo').optional().isIn(['organizador', 'participante']).withMessage('Tipo de usuário inválido.')
  ],
  userController.register
);

// Rota para login de usuário
router.post('/login', userController.login);

// Rota para listar todos os usuários (somente admin)
router.get('/', verificarToken, autorizar('admin'), userController.listAll);

// Rota para deletar um usuário (somente admin)
router.delete('/:id', verificarToken, autorizar('admin'), userController.deleteUser);

// Exporta as rotas para usar no app principal
module.exports = router;
