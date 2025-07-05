// Script simples para testar a API
const testData = {
  email: "usuario@exemplo.com",
  password: "123456"
};

console.log('🧪 Testando login com dados:', testData);

fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Resposta da API:', data);
})
.catch(error => {
  console.error('❌ Erro:', error);
});
