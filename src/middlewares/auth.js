const jwt = require('jsonwebtoken');

// Verifica se o token JWT foi enviado e é válido
exports.verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });

    req.usuario = usuario; // Salva os dados do token na requisição
    next();
  });
};

// Middleware para autorizar tipos de usuários específicos (ex: "organizador")
exports.autorizar = (...tipos) => {
  return (req, res, next) => {
    if (!tipos.includes(req.usuario.tipo)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};
