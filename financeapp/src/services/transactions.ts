import apiService from './api';
import authService from './auth';

export interface CreateTransactionRequest {
  type: 'income' | 'expense';
  amount: number;
  title?: string;
  description: string;
  date: string;
  categoryId: string;
  accountId: string;
  cardId?: string;
  paymentMethod?: 'cash' | 'pix' | 'card';
  launchType?: 'unico' | 'recorrente' | 'parcelado';
  installments?: number;
  valorComoParcela?: boolean;
  recurrenceType?: 'Anual' | 'Mensal' | 'Semanal';
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  title?: string;
  description: string;
  date: string;
  categoryId: string;
  accountId: string;
  cardId?: string;
  paymentMethod?: 'cash' | 'pix' | 'card';
  launchType: 'unico' | 'recorrente' | 'parcelado';
  installments?: number;
  valorComoParcela?: boolean;
  recurrenceType?: 'Anual' | 'Mensal' | 'Semanal';
  currentInstallment?: number;
  parentTransactionId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
    type: 'income' | 'expense';
  };
  account?: {
    id: string;
    name: string;
    type: string;
    balance: number;
    color: string;
    icon: string;
  };
  card?: {
    id: string;
    name: string;
    lastFour: string;
    type: string;
    brand: string;
    color: string;
  };
  parentTransaction?: {
    id: string;
    title?: string;
    installments?: number;
  };
  childTransactions?: {
    id: string;
    date: string;
    currentInstallment?: number;
  }[];
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateTransactionResponse {
  message: string;
  transactions: Transaction[];
  count: number;
}

class TransactionsService {
  // Criar transação
  async createTransaction(transactionData: CreateTransactionRequest) {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }

      console.log('📤 Enviando transação para o backend:', transactionData);

      const response = await apiService.post<CreateTransactionResponse>(
        '/transactions',
        transactionData,
        token
      );

      if (response.error) {
        console.error('❌ Erro ao criar transação:', response.error);
        return { error: response.error, details: response.details };
      }

      console.log('✅ Transação criada com sucesso:', response.data);
      return { data: response.data };
    } catch (error) {
      console.error('❌ Erro na requisição de criação de transação:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Listar transações
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: 'income' | 'expense';
    categoryId?: string;
    accountId?: string;
    cardId?: string;
    launchType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const token = await authService.getToken();
      if (!token) {
        console.error('❌ Token de autenticação não encontrado');
        return { error: 'Token de autenticação não encontrado' };
      }

      console.log('🔑 Token encontrado, fazendo requisição...');

      // Construir query string
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = `/transactions${queryString ? `?${queryString}` : ''}`;

      console.log('📤 Buscando transações do usuário logado...');
      console.log('🔗 Endpoint:', endpoint);

      const response = await apiService.get<TransactionsResponse>(endpoint, token);

      if (response.error) {
        console.error('❌ Erro ao buscar transações:', response.error);
        return { error: response.error, details: response.details };
      }

      console.log('✅ Transações encontradas:', response.data?.transactions.length || 0);
      return { data: response.data };
    } catch (error) {
      console.error('❌ Erro na requisição de listagem de transações:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Obter transação por ID
  async getTransaction(id: string) {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }

      const response = await apiService.get<{ transaction: Transaction }>(
        `/transactions/${id}`,
        token
      );

      if (response.error) {
        console.error('❌ Erro ao buscar transação:', response.error);
        return { error: response.error, details: response.details };
      }

      return { data: response.data };
    } catch (error) {
      console.error('❌ Erro na requisição de busca de transação:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Atualizar transação
  async updateTransaction(id: string, updates: Partial<CreateTransactionRequest>) {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }

      console.log('📤 Atualizando transação:', { id, updates });

      const response = await apiService.put<{ transaction: Transaction }>(
        `/transactions/${id}`,
        updates,
        token
      );

      if (response.error) {
        console.error('❌ Erro ao atualizar transação:', response.error);
        return { error: response.error, details: response.details };
      }

      console.log('✅ Transação atualizada com sucesso');
      return { data: response.data };
    } catch (error) {
      console.error('❌ Erro na requisição de atualização de transação:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Deletar transação
  async deleteTransaction(id: string) {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }

      console.log('📤 Deletando transação:', id);

      const response = await apiService.delete<{ message: string }>(
        `/transactions/${id}`,
        token
      );

      if (response.error) {
        console.error('❌ Erro ao deletar transação:', response.error);
        return { error: response.error, details: response.details };
      }

      console.log('✅ Transação deletada com sucesso');
      return { data: response.data };
    } catch (error) {
      console.error('❌ Erro na requisição de deleção de transação:', error);
      return { error: 'Erro de conexão' };
    }
  }
}

export default new TransactionsService();
