# InFinance Backend API

Backend para aplicativo de finanças pessoais desenvolvido com Node.js, Express e Prisma PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **express-validator** - Validação de dados

## 📦 Instalação

1. **Clone o repositório e navegue para o backend:**
```bash
cd backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
O arquivo `.env` já está configurado com:
```env
DATABASE_URL="postgresql://postgres:2686@localhost:5432/Finance"
JWT_SECRET=seuSegredoMuitoSeguro
JWT_EXPIRES_IN=7d
```

4. **Execute as migrações do banco:**
```bash
npm run prisma:migrate
```

5. **Execute o seed para popular o banco:**
```bash
npm run prisma:seed
```

6. **Inicie o servidor:**
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 📖 Documentação da API

### Base URL
```
http://localhost:3000/api
```

### 🔐 Autenticação

#### POST `/auth/register`
Registrar novo usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "MinhaSenh@123",
  "phone": "11999999999"
}
```

**Response:**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "clx...",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "11999999999",
    "avatar": null,
    "createdAt": "2025-01-04T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST `/auth/login`
Fazer login

**Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "MinhaSenh@123"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": "clx...",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "11999999999",
    "avatar": null,
    "createdAt": "2025-01-04T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET `/auth/me`
Obter dados do usuário logado

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "11999999999",
    "avatar": null,
    "createdAt": "2025-01-04T..."
  }
}
```

#### PUT `/auth/profile`
Atualizar perfil do usuário

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "João Silva Santos",
  "phone": "11888888888",
  "avatar": "https://exemplo.com/avatar.jpg"
}
```

#### PUT `/auth/change-password`
Alterar senha

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "currentPassword": "MinhaSenh@123",
  "newPassword": "NovaSenha@456"
}
```

### 🏥 Health Check

#### GET `/health`
Verificar status da API

**Response:**
```json
{
  "message": "API InFinance está funcionando!",
  "timestamp": "2025-01-04T...",
  "version": "1.0.0"
}
```

## 🔒 Segurança

- **Rate Limiting**: 100 requests por 15 minutos (geral), 5 requests por 15 minutos (login)
- **Helmet**: Headers de segurança
- **CORS**: Configurado para frontend
- **JWT**: Tokens com expiração
- **bcryptjs**: Hash de senhas com salt 12

## 🗄️ Banco de Dados

### Modelos principais:

- **User**: Usuários do sistema
- **Account**: Contas bancárias
- **Category**: Categorias de transações
- **Transaction**: Transações financeiras
- **Goal**: Metas financeiras
- **Card**: Cartões de crédito/débito

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Inicia servidor em modo desenvolvimento
npm start            # Inicia servidor em produção
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:migrate   # Executa migrações
npm run prisma:studio    # Abre Prisma Studio
npm run prisma:seed      # Popula banco com dados iniciais
```

## 👤 Usuário de Teste

Após executar o seed, você pode usar:
- **Email**: `usuario@exemplo.com`
- **Senha**: `123456`

## 🚀 Deploy

Para deploy em produção:

1. Configure as variáveis de ambiente adequadas
2. Execute `npm run prisma:migrate`
3. Execute `npm start`

## 📝 Validações

### Registro:
- Nome: 2-50 caracteres
- Email: formato válido
- Senha: mínimo 6 caracteres, deve conter maiúscula, minúscula e número
- Telefone: formato brasileiro (opcional)

### Login:
- Email: formato válido
- Senha: obrigatória

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request
