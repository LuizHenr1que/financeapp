import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

const TOKEN_KEY = '@InFinance:token';
const USER_KEY = '@InFinance:user';

class AuthService {
  // Login
  async login(credentials: LoginRequest) {
    try {
      console.log('🚀 Tentando fazer login...', { email: credentials.email });
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      if (response.error) {
        console.error('❌ Erro no login:', response.error);
        return { error: response.error, details: response.details };
      }

      if (response.data) {
        console.log('✅ Login bem-sucedido!', { 
          user: response.data.user.email, 
          token: response.data.token.substring(0, 20) + '...' 
        });
        
        // Salvar token e dados do usuário
        await this.saveAuthData(response.data.token, response.data.user);
        console.log('💾 Token e dados do usuário salvos no AsyncStorage');
        
        return { data: response.data };
      }

      return { error: 'Resposta inválida do servidor' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Registro
  async register(userData: RegisterRequest) {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', userData);
      
      if (response.error) {
        return { error: response.error, details: response.details };
      }

      if (response.data) {
        // Salvar token e dados do usuário
        await this.saveAuthData(response.data.token, response.data.user);
        return { data: response.data };
      }

      return { error: 'Resposta inválida do servidor' };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Obter dados do usuário atual
  async getCurrentUser() {
    try {
      const token = await this.getToken();
      if (!token) {
        return { error: 'Token não encontrado' };
      }

      const response = await apiService.get<{ user: User }>('/auth/me', token);
      
      if (response.error) {
        return { error: response.error };
      }

      if (response.data) {
        // Atualizar dados do usuário no storage
        await this.saveUser(response.data.user);
        return { data: response.data.user };
      }

      return { error: 'Resposta inválida do servidor' };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Atualizar perfil
  async updateProfile(profileData: UpdateProfileRequest) {
    try {
      const token = await this.getToken();
      if (!token) {
        return { error: 'Token não encontrado' };
      }

      const response = await apiService.put<{ message: string; user: User }>(
        '/auth/profile',
        profileData,
        token
      );
      
      if (response.error) {
        return { error: response.error, details: response.details };
      }

      if (response.data) {
        // Atualizar dados do usuário no storage
        await this.saveUser(response.data.user);
        return { data: response.data };
      }

      return { error: 'Resposta inválida do servidor' };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Alterar senha
  async changePassword(passwordData: ChangePasswordRequest) {
    try {
      const token = await this.getToken();
      if (!token) {
        return { error: 'Token não encontrado' };
      }

      const response = await apiService.put<{ message: string }>(
        '/auth/change-password',
        passwordData,
        token
      );
      
      if (response.error) {
        return { error: response.error, details: response.details };
      }

      return { data: response.data };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return { error: 'Erro de conexão' };
    }
  }

  // Logout
  async logout() {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { error: 'Erro ao fazer logout' };
    }
  }

  // Verificar se está logado
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  // Obter token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  // Obter usuário do storage
  async getStoredUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  }

  // Salvar dados de autenticação
  private async saveAuthData(token: string, user: User) {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEY, token],
        [USER_KEY, JSON.stringify(user)],
      ]);
    } catch (error) {
      console.error('Erro ao salvar dados de auth:', error);
      throw error;
    }
  }

  // Salvar usuário
  private async saveUser(user: User) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      throw error;
    }
  }

  // Verificar se o token é válido (não expirado)
  async validateToken(): Promise<boolean> {
    try {
      const response = await this.getCurrentUser();
      return !response.error;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();
