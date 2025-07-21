const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Rota para iniciar a autenticação com o Google
// O 'prompt: select_account' força o usuário a escolher uma conta Google toda vez.
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

// Rota de callback do Google após a autenticação
router.get(
  '/google/callback',
  // session: false é crucial porque estamos usando JWTs, não sessões de servidor.
  passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
  (req, res) => {
    // Se a autenticação for bem-sucedida, o Passport anexa o usuário a req.user.
    // Geramos um token JWT para esse usuário.
    const token = jwt.sign({ id: req.user.id, tipo: req.user.tipo }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Em um app real, você redirecionaria para o frontend com o token.
    // Ex: res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
    res.json({ message: 'Autenticação com Google bem-sucedida!', token, usuario: req.user });
  }
);

// Rota para iniciar a autenticação com o GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Rota de callback do GitHub
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login-failed' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, tipo: req.user.tipo }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Autenticação com GitHub bem-sucedida!', token, usuario: req.user });
  }
);

module.exports = router;