// Exemplo simples de funções para registrar e autenticar usuários
const connection = require('../database'); // O pool já retorna promises
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Cadastro de novo usuário
exports.register = async (req, res) => {
  try {
    // Verifica se houve erros de validação definidos na rota
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, email, senha, tipo } = req.body;

    // Criptografa a senha antes de salvar no banco
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const tipoUsuario = tipo || 'participante'; // Garante 'participante' como padrão

    // Insere o novo usuário no banco
    const sql = 'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)';
    await connection.query(sql, [nome, email, senhaCriptografada, tipoUsuario]);

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Este email já está em uso.' });
    }
    console.error('Erro no registro:', err);
    return res.status(500).json({ error: 'Erro ao registrar usuário', details: err.message });
  }
};

// Login do usuário
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    const [results] = await connection.query(sql, [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const usuario = results[0];

    // Verifica se a senha está correta
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Cria token JWT com o ID e tipo de usuário
    const token = jwt.sign({ id: usuario.id, tipo: usuario.tipo },
      process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login realizado com sucesso', token });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
  }
};
