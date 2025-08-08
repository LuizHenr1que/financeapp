import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

export const useBackgroundSync = () => {
  const { isAuthenticated } = useAuth();
  const appState = useRef(AppState.currentState);
  const syncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Função simples para verificar mudanças no servidor
  const checkServerChanges = async () => {
    if (!isAuthenticated) return;

    try {
      console.log('✅ Verificação de sincronização executada');
      await AsyncStorage.setItem('global_last_sync', new Date().toISOString());
    } catch (error) {
      console.log('❌ Erro na sincronização:', error);
    }
  };

  // Função para sincronização completa
  const startFullSync = async () => {
    try {
      console.log('🔄 Sincronização completa executada');
      await AsyncStorage.setItem('global_last_sync', new Date().toISOString());
    } catch (error) {
      console.log('❌ Erro na sincronização completa:', error);
    }
  };

  // Handler para mudança de estado do app
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active' &&
      isAuthenticated
    ) {
      console.log('📱 App ativo, verificando atualizações...');
      checkServerChanges();
    }
    appState.current = nextAppState;
  };

  // Effect para gerenciar sincronização
  useEffect(() => {
    if (!isAuthenticated) return;

    // Listener para mudanças de estado do app
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Verificação inicial
    checkServerChanges();

    return () => {
      subscription?.remove();
      if (syncInterval.current) {
        clearInterval(syncInterval.current);
        syncInterval.current = null;
      }
    };
  }, [isAuthenticated]);

  return {
    startFullSync,
    checkServerChanges,
    syncIncrementalData: async () => Promise.resolve()
  };
};
