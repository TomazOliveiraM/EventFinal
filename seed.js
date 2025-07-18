// Importa os módulos necessários
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');

// Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
require('dotenv').config();

// --- Dados dos usuários que serão criados ---
const usersToSeed = [
  {
    nome: 'Organizador Teste',
    email: 'organizador@example.com',
    senha: 'password123', // Senha em texto plano
    tipo: 'organizador',
  },
  {
    nome: 'Participante Teste',
    email: 'participante@example.com',
    senha: 'password123', // Senha em texto plano
    tipo: 'participante',
  },
  {
    nome: 'Admin Teste',
    email: 'admin@example.com',
    senha: 'password123',
    tipo: 'admin'
  }
];

// Função principal para popular o banco de dados
async function seedDatabase() {
  let connection;
  try {
    // Verifica se as variáveis de ambiente essenciais estão definidas
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_DATABASE'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);

    if (missingVars.length > 0) {
      console.error('--------------------------------------------------------------------');
      console.error('>> ERRO DE CONFIGURAÇÃO: As seguintes variáveis de ambiente estão faltando no seu arquivo .env: <<');
      missingVars.forEach(v => console.error(` - ${v}`));
      console.error('\n>> Por favor, adicione as variáveis faltantes ao seu arquivo .env e tente novamente.');
      console.error('--------------------------------------------------------------------');
      return; // Encerra a execução do script
    }

    // Cria a conexão com o banco de dados usando as variáveis de ambiente
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    console.log('Conectado ao banco de dados com sucesso.');

    const sql = 'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)';

    for (const user of usersToSeed) {
      const hashedPassword = await bcrypt.hash(user.senha, 10);
      try {
        await connection.execute(sql, [user.nome, user.email, hashedPassword, user.tipo]);
        console.log(`Usuário '${user.email}' criado com sucesso.`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`Usuário '${user.email}' já existe. Ignorando.`);
        } else {
          throw error;
        }
      }
    }
    console.log('Script finalizado!');
  } catch (error) {
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('--------------------------------------------------------------------');
      console.error(`>> ERRO: O banco de dados '${process.env.DB_DATABASE}' não foi encontrado. <<`);
      console.error('>> Por favor, crie o banco de dados no seu MySQL antes de continuar.');
      console.error('--------------------------------------------------------------------');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('--------------------------------------------------------------------');
      console.error(`>> ERRO: Acesso negado para o usuário '${process.env.DB_USER}'. <<`);
      console.error('>> Verifique se a senha no arquivo .env está correta.');
      console.error('--------------------------------------------------------------------');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('--------------------------------------------------------------------');
      console.error('>> ERRO DE CONEXÃO: Não foi possível conectar ao banco de dados. <<');
      console.error('>> Verifique se o seu servidor MySQL (XAMPP, WAMP, etc.) está em execução e se as credenciais no arquivo .env estão corretas.');
      console.error('--------------------------------------------------------------------');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('--------------------------------------------------------------------');
      console.error(`>> ERRO: A tabela '${error.sqlMessage.split("'")[1]}' não existe no banco de dados '${process.env.DB_DATABASE}'. <<`);
      console.error('>> Você precisa criar as tabelas antes de popular o banco de dados.');
      console.error('>> Execute o script SQL para criar a estrutura do banco de dados.');
      console.error('--------------------------------------------------------------------');
    } else {
      console.error('Erro ao popular o banco de dados:', error);
    }
  } finally {
    if (connection) await connection.end();
  }
}

seedDatabase();