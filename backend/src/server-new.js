require('dotenv').config();
const app = require('./app');
const prisma = require('./config/database');

const PORT = process.env.PORT || 3000;

console.log(' DATABASE_URL:', process.env.DATABASE_URL);

// Função para iniciar o servidor
async function startServer() {
  try {
    // Testar conexão com o banco
    await prisma.$connect();
    console.log(' Conectado ao banco de dados PostgreSQL');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(` Servidor rodando na porta ${PORT}`);
      console.log(` API disponível em http://localhost:${PORT}/api`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error(' Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de encerramento graceful
process.on('SIGINT', async () => {
  console.log('\n Encerrando servidor...');
  await prisma.$disconnect();
  console.log(' Desconectado do banco de dados');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n Encerrando servidor...');
  await prisma.$disconnect();
  console.log('Desconectado do banco de dados');
  process.exit(0);
});

// Iniciar servidor apenas se não estivermos em modo de teste
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
