import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import authService, { User as AuthUser } from '@/src/services/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Verificando estado de autenticação...');
      const isAuth = await authService.isAuthenticated();
      console.log('🔑 Está autenticado?', isAuth);
      
      if (isAuth) {
        const storedUser = await authService.getStoredUser();
        console.log('👤 Usuário armazenado:', storedUser?.email || 'Nenhum');
        
        if (storedUser) {
          // Mapear o usuário armazenado para o tipo correto
          const su = storedUser as any;
          const mappedStoredUser: User = {
            ...storedUser,
            isPremium: su.isPremium ?? false,
            premiumPlan: su.premiumPlan ?? undefined,
            premiumStartDate: su.premiumStartDate ?? undefined,
            premiumEndDate: su.premiumEndDate ?? undefined,
          };
          setUser(mappedStoredUser);
          setIsAuthenticated(true);
          
          // Validar token e atualizar dados do usuário
          console.log('📡 Validando token com o servidor...');
          const response = await authService.getCurrentUser();
          if (response.data) {
            console.log('✅ Token válido, usuário atualizado');
            // Mapear os dados do backend para o tipo local User
            const baseUser = (response.data as any).user ?? response.data;
            const mappedUser: User = {
              ...baseUser,
              isPremium: baseUser.isPremium ?? false,
              premiumPlan: baseUser.premiumPlan ?? undefined,
              premiumStartDate: baseUser.premiumStartDate ?? undefined,
              premiumEndDate: baseUser.premiumEndDate ?? undefined,
            };
            setUser(mappedUser);
          } else if (response.error) {
            console.log('❌ Token inválido, fazendo logout:', response.error);
            // Token inválido, fazer logout
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        console.log('❌ Usuário não autenticado');
      }
    } catch (error) {
      console.error('Erro ao verificar estado de autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('🚀 Tentando fazer login...', { email });
      
      const response = await authService.login({ email, password });
      
      if (response.error) {
        console.error('❌ Erro no login:', response.error);
        return { success: false, error: response.error };
      }
      
      if (response.data) {
        const baseUser = (response.data as any).user ?? response.data;
        const mappedUser: User = {
          ...baseUser,
          isPremium: baseUser.isPremium ?? false,
          premiumPlan: baseUser.premiumPlan ?? undefined,
          premiumStartDate: baseUser.premiumStartDate ?? undefined,
          premiumEndDate: baseUser.premiumEndDate ?? undefined,
        };
        setUser(mappedUser);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { success: false, error: 'Resposta inválida do servidor' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('📝 Tentando registrar usuário...', { name, email });
      
      const response = await authService.register({ name, email, password, phone });
      
      if (response.error) {
        console.error('❌ Erro no registro:', response.error);
        return { success: false, error: response.error };
      }
      
      if (response.data) {
        const baseUser = (response.data as any).user ?? response.data;
        const mappedUser: User = {
          ...baseUser,
          isPremium: baseUser.isPremium ?? false,
          premiumPlan: baseUser.premiumPlan ?? undefined,
          premiumStartDate: baseUser.premiumStartDate ?? undefined,
          premiumEndDate: baseUser.premiumEndDate ?? undefined,
        };
        setUser(mappedUser);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { success: false, error: 'Resposta inválida do servidor' };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    data: { name?: string; phone?: string; avatar?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('📝 Atualizando perfil...', data);
      
      const response = await authService.updateProfile(data);
      
      if (response.error) {
        console.error('❌ Erro ao atualizar perfil:', response.error);
        return { success: false, error: response.error };
      }
      
      if (response.data) {
        const baseUser = (response.data as any).user ?? response.data;
        const mappedUser: User = {
          ...baseUser,
          isPremium: baseUser.isPremium ?? false,
          premiumPlan: baseUser.premiumPlan ?? undefined,
          premiumStartDate: baseUser.premiumStartDate ?? undefined,
          premiumEndDate: baseUser.premiumEndDate ?? undefined,
        };
        setUser(mappedUser);
        return { success: true };
      }
      
      return { success: false, error: 'Resposta inválida do servidor' };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('🔒 Alterando senha...');
      
      const response = await authService.changePassword({ currentPassword, newPassword });
      
      if (response.error) {
        console.error('❌ Erro ao alterar senha:', response.error);
        return { success: false, error: response.error };
      }
      
      console.log('✅ Senha alterada com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return { success: false, error: 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('🚪 Fazendo logout...');
      
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      updateProfile,
      changePassword,
      isLoading,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}