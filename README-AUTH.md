# InFinance App - Frontend

Frontend do aplicativo de finanças pessoais desenvolvido com React Native e Expo.

## 🚀 Tecnologias

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Linguagem tipada
- **Expo Router** - Navegação
- **AsyncStorage** - Armazenamento local
- **Lucide Icons** - Ícones
- **React Native Reanimated** - Animações

## 📦 Instalação

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure o backend:**
   - Certifique-se de que o backend está rodando em `http://localhost:3000`
   - Se necessário, altere a URL em `src/services/api.ts`

3. **Inicie o app:**
```bash
npm run dev
```

## 🔐 Autenticação

O app possui sistema completo de autenticação:

### Funcionalidades implementadas:
- ✅ Login com email e senha
- ✅ Registro de novos usuários
- ✅ Validação de formulários
- ✅ Persistência de sessão
- ✅ Logout
- ✅ Proteção de rotas
- ✅ Atualização automática de dados do usuário

### Telas de Auth:
- **Login** (`/login`) - Acesso ao app
- **Registro** (`/register`) - Criação de conta
- **Perfil** (`/profile`) - Dados do usuário e logout

### Dados do usuário:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 📱 Estrutura do App

```
app/
├── _layout.tsx          # Layout principal
├── AppRoutes.tsx        # Roteamento com proteção de auth
├── index.tsx           # Tela inicial
├── login.tsx           # Tela de login
├── register.tsx        # Tela de registro
├── profile.tsx         # Tela de perfil
└── (tabs)/             # Telas principais do app
    ├── index.tsx       # Dashboard
    ├── transactions.tsx # Transações
    ├── cards.tsx       # Cartões
    └── ...

src/
├── services/
│   ├── api.ts          # Configuração da API
│   └── auth.ts         # Serviços de autenticação
└── ...

context/
├── AuthContext.tsx     # Contexto de autenticação
└── ...
```

## 🔧 Configuração

### API Configuration
Arquivo: `src/services/api.ts`
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

### Funcionalidades de Auth no Context

```typescript
const { 
  user,              // Dados do usuário logado
  login,             // Função de login
  register,          // Função de registro
  logout,            // Função de logout
  updateProfile,     // Atualizar perfil
  changePassword,    // Alterar senha
  isLoading,         // Estado de loading
  isAuthenticated    // Status de autenticação
} = useAuth();
```

## 🧪 Teste do Login

### Usuário de teste (após executar seed no backend):
- **Email**: `usuario@exemplo.com`
- **Senha**: `123456`

### Criando novo usuário:
1. Vá para a tela de registro
2. Preencha os dados:
   - Nome: mínimo 2 caracteres
   - Email: formato válido
   - Telefone: opcional
   - Senha: mínimo 6 caracteres, deve conter maiúscula, minúscula e número
3. Aceite os termos
4. Clique em "Criar Conta"

## 🔄 Fluxo de Autenticação

1. **App inicia** → Verifica se existe token salvo
2. **Token existe** → Valida token com backend → Redireciona para app
3. **Token inválido/inexistente** → Redireciona para login
4. **Login bem-sucedido** → Salva token e dados → Redireciona para app
5. **Logout** → Remove token e dados → Redireciona para login

## 📝 Validações

### Login:
- Email obrigatório e formato válido
- Senha obrigatória

### Registro:
- Nome: 2-50 caracteres
- Email: formato válido e único
- Telefone: opcional, formato brasileiro
- Senha: mínimo 6 caracteres com maiúscula, minúscula e número
- Confirmação de senha deve coincidir
- Aceitar termos obrigatório

## 🚨 Tratamento de Erros

- Erros de rede são tratados e exibidos ao usuário
- Validações em tempo real nos formulários
- Feedback visual para estados de loading
- Alertas informativos para ações importantes

## 🔗 Integração com Backend

O frontend se comunica com o backend através de:

- **POST** `/api/auth/login` - Login
- **POST** `/api/auth/register` - Registro
- **GET** `/api/auth/me` - Dados do usuário
- **PUT** `/api/auth/profile` - Atualizar perfil
- **PUT** `/api/auth/change-password` - Alterar senha

Todas as requisições autenticadas incluem o header:
```
Authorization: Bearer {token}
```

## 🎨 Interface

- Design moderno com gradientes
- Feedback visual para interações
- Campos de input customizados
- Validação em tempo real
- Loading states
- Tratamento de erros visual

## 🚀 Próximos Passos

- [ ] Implementar "Esqueci minha senha"
- [ ] Adicionar autenticação com Google/Apple
- [ ] Implementar upload de avatar
- [ ] Adicionar configurações de segurança
- [ ] Implementar notificações push
