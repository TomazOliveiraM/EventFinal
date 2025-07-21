// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const bcrypt = require('bcrypt');
const connection = require('./src/database');

async function seedDatabase() {
  try {
    console.log('Iniciando o script de popular o banco de dados...');

    // Limpa a tabela de usuários para evitar duplicatas ao rodar o script várias vezes
    await connection.query('DELETE FROM usuarios');
    console.log('Tabela de usuários limpa.');

    // Criptografa as senhas
    const senhaPadrao = 'senha123';
    const senhaCriptografada = await bcrypt.hash(senhaPadrao, 10);

    // Define os usuários de exemplo
    const usuarios = [
      { nome: 'Admin Master', email: 'admin@email.com', senha: senhaCriptografada, tipo: 'admin' },
      { nome: 'Organizador Eventos', email: 'organizador@email.com', senha: senhaCriptografada, tipo: 'organizador' },
      { nome: 'Participante Teste', email: 'participante@email.com', senha: senhaCriptografada, tipo: 'participante' },
    ];

    // Insere os usuários no banco de dados
    const query = 'INSERT INTO usuarios (nome, email, senha, tipo) VALUES ?';
    await connection.query(query, [usuarios.map(u => [u.nome, u.email, u.senha, u.tipo])]);

    console.log('Usuários de exemplo inseridos com sucesso!');
    console.log('------------------------------------------');
    console.log('Logins de Exemplo:');
    usuarios.forEach(u => {
      console.log(`- Email: ${u.email} | Senha: ${senhaPadrao} | Tipo: ${u.tipo}`);
    });
    console.log('------------------------------------------');

  } catch (error) {
    console.error('Ocorreu um erro ao popular o banco de dados:', error);
  } finally {
    // Fecha a conexão com o banco de dados
    await connection.end();
    console.log('Conexão com o banco de dados fechada.');
  }
}

// Executa a função
seedDatabase();