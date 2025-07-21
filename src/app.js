// Carrega as variáveis do arquivo .env (como DB_HOST, DB_USER, etc.)
// **Esta deve ser a PRIMEIRA linha do arquivo para que funcione corretamente**
require('dotenv').config();

const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
// Importa o framework Express
const express = require('express');

// Módulo nativo do Node.js para trabalhar com caminhos de arquivos
const path = require('path');

// Carrega a configuração da estratégia do Passport (Google, etc.)
require('./config/passport-setup');
// Inicializa a conexão com o banco de dados.
// Como o dotenv já foi carregado, ele vai usar as variáveis corretas.
require('./database');

// Importa as rotas de usuário, eventos e inscrições
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const inscricaoRoutes = require('./routes/inscricaoRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');

// Cria a aplicação Express
const app = express();

// Define a porta do servidor. Se tiver PORT no .env, usa ela; senão, usa 3003
const PORT = process.env.PORT || 3003;

// Middlewares de segurança e configuração
// Helmet adiciona cabeçalhos de segurança HTTP para proteger contra vulnerabilidades comuns
app.use(helmet());
// Habilita o CORS para permitir requisições de outras origens (essencial para o frontend)
app.use(cors());
// Middleware para interpretar JSON no corpo das requisições (req.body)
app.use(express.json());

// Inicializa o Passport
app.use(passport.initialize());

// Define a pasta onde ficarão os arquivos estáticos (como index.html, CSS, etc.)
app.use(express.static(path.join(__dirname, 'views')));

// Define o prefixo das rotas de usuário: /api/users
app.use('/api/users', userRoutes);

// Define o prefixo para rotas de autenticação externa (Google, etc.)
app.use('/api/auth', authRoutes);

// Define o prefixo das rotas de eventos: /api/events
app.use('/api/events', eventRoutes);

// Define o prefixo das rotas de inscrições: /api/inscricoes
app.use('/api/inscricoes', inscricaoRoutes);

// Define o prefixo das rotas de comentários: /api/comentarios
app.use('/api/comentarios', comentarioRoutes);

// Rota principal (GET /) → envia o arquivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Middleware de tratamento de erros global.
// Deve ser o último `app.use` para capturar erros de todas as rotas anteriores.
app.use((err, req, res, next) => {
  console.error(err.stack); // Loga o erro completo no console do servidor
  res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor.' });
});

// Inicia o servidor na porta definida
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Exporta o app para ser usado nos testes com Supertest
module.exports = app;
