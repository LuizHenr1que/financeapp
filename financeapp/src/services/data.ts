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
  lastFour: string;
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
      return { data: response.data };
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
      return { success: true };
    } catch (error) {
      console.error('❌ Erro na requisição de exclusão de categoria:', error);
      return { error: 'Erro de conexão' };
    }
  }
}

export default new DataService();
