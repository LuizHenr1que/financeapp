import apiService from './api';
import authService from './auth';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  userId: string;
}

export interface Card {
  id: string;
  name: string;
  type: 'credit' | 'debit';
  brand: string;
  color: string;
  limit?: number;
  userId: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  icon: string;
  userId: string;
  includeInTotal: boolean; // Adicionado para checkbox
}

class DataService {
  // Buscar categorias do usuário
  async getCategories() {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }

      console.log('📂 Buscando categorias do usuário...');

      const response = await apiService.get<{ categories: Category[] }>('/categories', token);

      if (response.error) {
        console.error('❌ Erro ao buscar categorias:', response.error);
        return { error: response.error, details: response.details };
      }

      console.log('✅ Categorias encontradas:', response.data?.categories.length || 0);
      return { data: response.data };
    } catch (error) {
      console.error('❌ Erro na requisição de categorias:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Buscar cartões do usuário
  async getCards() {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }

      console.log('💳 Buscando cartões do usuário...');

      const response = await apiService.get<{ cards: Card[] }>('/cards', token);

      if (response.error) {
        console.error('❌ Erro ao buscar cartões:', response.error);
        return { error: response.error, details: response.details };
      }

      console.log('✅ Cartões encontrados:', response.data?.cards.length || 0);
      return { data: response.data };
    } catch (error) {
      console.error('❌ Erro na requisição de cartões:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Buscar contas do usuário
  async getAccounts() {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }

      console.log('🏦 Buscando contas do usuário...');

      const response = await apiService.get<{ accounts: Account[] }>('/accounts', token);

      if (response.error) {
        console.error('❌ Erro ao buscar contas:', response.error);
        return { error: response.error, details: response.details };
      }

      console.log('✅ Contas encontradas:', response.data?.accounts.length || 0);
      return { data: response.data };
    } catch (error) {
      console.error('❌ Erro na requisição de contas:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Criar nova categoria no backend
  async createCategory(category: Omit<Category, 'id' | 'userId'>) {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }
      console.log('📤 Enviando nova categoria para o backend...', category);
      const response = await apiService.post<{ category: Category }>('/categories', category, token);
      if (response.error) {
        console.error('❌ Erro ao criar categoria:', response.error);
        return { error: response.error, details: response.details };
      }
      console.log('✅ Categoria criada no backend:', response.data?.category);
      return { data: response.data, message: 'Categoria criada com sucesso' };
    } catch (error) {
      console.error('❌ Erro na requisição de criação de categoria:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Excluir categoria do backend
  async deleteCategory(id: string) {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }
      console.log('🗑️ Excluindo categoria do backend...', id);
      const response = await apiService.delete(`/categories/${id}`, token);
      if (response.error) {
        console.error('❌ Erro ao excluir categoria:', response.error);
        return { error: response.error, details: response.details };
      }
      // Corrige: retorna mensagem do backend se existir, senão mensagem padrão
      return { success: true, message: (response.data && (response.data as { message?: string }).message) || 'Categoria excluída com sucesso' };
    } catch (error) {
      console.error('❌ Erro na requisição de exclusão de categoria:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Atualizar categoria no backend
  async updateCategory(id: string, categoryUpdate: Partial<Category>) {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }
      console.log('✏️ Atualizando categoria no backend...', id, categoryUpdate);
      const response = await apiService.put<{ category: Category }>(`/categories/${id}`, categoryUpdate, token);
      if (response.error) {
        console.error('❌ Erro ao atualizar categoria:', response.error);
        return { error: response.error, details: response.details };
      }
      return { data: response.data, message: 'Categoria atualizada com sucesso' };
    } catch (error) {
      console.error('❌ Erro na requisição de atualização de categoria:', error);
      return { error: 'Erro de conexão' };
    }
  }

  async updateAccount(id: string, accountUpdate: Partial<Account>) {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }
      console.log('✏️ Atualizando conta no backend...', id, accountUpdate);
      const response = await apiService.put<{ account: Account }>(`/accounts/${id}`, accountUpdate, token);
      if (response.error) {
        console.error('❌ Erro ao atualizar conta:', response.error);
        return { error: response.error, details: response.details };
      }
      return { data: response.data, message: 'Conta atualizada com sucesso' };
    } catch (error) {
      console.error('❌ Erro na requisição de atualização de conta:', error);
      return { error: 'Erro de conexão' };
    }
  }

  async deleteAccount(id: string) {
    try {
      const token = await authService.getToken();
      if (!token) {
        return { error: 'Token de autenticação não encontrado' };
      }
      console.log('🗑️ Excluindo conta do backend...', id);
      const response = await apiService.delete(`/accounts/${id}`, token);
      if (response.error) {
        console.error('❌ Erro ao excluir conta:', response.error);
        return { error: response.error, details: response.details };
      }
      return { success: true, message: (response.data && (response.data as { message?: string }).message) || 'Conta excluída com sucesso' };
    } catch (error) {
      console.error('❌ Erro na requisição de exclusão de conta:', error);
      return { error: 'Erro de conexão' };
    }
  }
}

export default new DataService();
