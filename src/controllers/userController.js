// Exemplo simples de funções para registrar e autenticar usuários
const User = require('../models/userModel');
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
    await User.create({
      nome,
      email,
      senha: senhaCriptografada, // Corrigido: use 'senha'
      tipo: tipoUsuario, // Corrigido: use 'tipo'
    });

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

    const usuario = await User.findByEmail(email);

    if (!usuario) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }


    // Verifica se a senha está correta
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Cria token JWT com o ID e tipo de usuário
    const token = jwt.sign({ id: usuario.id, tipo: usuario.tipo },
      process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login realizado com sucesso',
      token,
      // Retorna dados básicos para facilitar o uso no frontend e nos testes
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
  }
};

// Listar todos os usuários (apenas para admin)
exports.listAll = async (req, res) => {
  try {
    // Assumindo que seu userModel tem um método findAll()
    const usuarios = await User.findAll();
    res.status(200).json(usuarios);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários', details: err.message });
  }
};

// Deletar um usuário (apenas para admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Assumindo que seu userModel tem um método delete()
    const result = await User.delete(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.status(200).json({ message: 'Usuário removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    res.status(500).json({ error: 'Erro ao deletar usuário', details: err.message });
  }
};
