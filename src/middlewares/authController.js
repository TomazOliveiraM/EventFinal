const jwt = require('jsonwebtoken');

exports.googleCallback = (req, res) => {
  // Se a autenticação do Google foi bem-sucedida, o Passport anexa o usuário a `req.user`.
  const usuario = req.user;

  // Criamos um token JWT para esse usuário, exatamente como no login local.
  const token = jwt.sign(
    { id: usuario.id, tipo: usuario.tipo },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );


  
  // Para a API, retornamos o token diretamente.
  res.json({ message: 'Login com Google realizado com sucesso', token });
};