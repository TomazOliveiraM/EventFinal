// Importa o pacote mysql2 com suporte a Promises, que é mais moderno e compatível com async/await
const mysql = require('mysql2/promise');

// Verificação de segurança: Garante que as variáveis de ambiente essenciais foram carregadas
// Se o .env não for encontrado ou estiver incompleto, a aplicação vai parar aqui com uma mensagem clara.
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_DATABASE) {
  console.error('ERRO FATAL: As variáveis de ambiente do banco de dados (DB_HOST, DB_USER, DB_DATABASE) não foram carregadas. Verifique se o arquivo .env existe na raiz do projeto e está correto.');
  process.exit(1); // Para a execução do Node.js
}

// Cria um "pool" de conexões, que é mais eficiente para aplicações web
// do que uma única conexão. Ele já vem com suporte a async/await.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE, // Corrigido de DB_NAME para DB_DATABASE
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testa a conexão para garantir que tudo está funcionando na inicialização
pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado ao banco de dados MySQL.');
    connection.release(); // Libera a conexão de volta para o pool
  })
  .catch(err => {
    // Trata erros comuns de conexão para dar feedback mais claro
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('A conexão com o banco de dados foi fechada.');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('O banco de dados tem muitas conexões.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('A conexão com o banco de dados foi recusada. Verifique se o servidor MySQL está rodando.');
    } else {
    console.error('Erro ao conectar ao banco:', err); // erro de login ou permissão
    }
  });

// Exporta o pool para ser usado nos models e controllers
module.exports = pool;
