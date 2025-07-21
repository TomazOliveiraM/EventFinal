const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const comentarioController = require('../controllers/comentarioController');
const { verificarToken } = require('../middlewares/auth');

// Adicionar um novo comentário a um evento
// O evento_id virá no corpo da requisição (req.body)
router.post('/',
    verificarToken,
    [
        body('evento_id').isInt({ gt: 0 }).withMessage('O ID do evento é obrigatório.'),
        body('texto').notEmpty().withMessage('O texto do comentário é obrigatório.')
    ],
    comentarioController.create);

// Listar todos os comentários de um evento específico
router.get('/evento/:evento_id', comentarioController.listByEvent);


module.exports = router;