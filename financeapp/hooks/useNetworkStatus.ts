import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export interface ConnectivityState {
  isConnected: boolean;
  isChecking: boolean;
  lastCheck: Date | null;
  failedAttempts: number;
}

/**
 * Hook para monitorar conectividade de rede e status de sincronização
 * Fornece feedback visual para o usuário sobre problemas de conexão
 */
export function useNetworkStatus() {
  const [connectivity, setConnectivity] = useState<ConnectivityState>({
    isConnected: true,
    isChecking: false,
    lastCheck: null,
    failedAttempts: 0
  });

  const [syncStatus, setSyncStatus] = useState<{
    lastSync: Date | null;
    isSyncing: boolean;
    hasPendingChanges: boolean;
  }>({
    lastSync: null,
    isSyncing: false,
    hasPendingChanges: false
  });

  // Verifica conectividade
  const checkConnectivity = async (): Promise<boolean> => {
    if (connectivity.isChecking) return connectivity.isConnected;

    setConnectivity(prev => ({ ...prev, isChecking: true }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const isConnected = response.ok;

      setConnectivity(prev => ({
        ...prev,
        isConnected,
        isChecking: false,
        lastCheck: new Date(),
        failedAttempts: isConnected ? 0 : prev.failedAttempts + 1
      }));

      // Mostra toast se perdeu conexão
      if (!isConnected && connectivity.isConnected) {
        Toast.show({
          type: 'error',
          text1: '📡 Sem conexão',
          text2: 'Dados podem estar desatualizados',
          visibilityTime: 3000
        });
      }

      // Mostra toast se recuperou conexão após falhas
      if (isConnected && !connectivity.isConnected && connectivity.failedAttempts > 0) {
        Toast.show({
          type: 'success',
          text1: '✅ Conexão restaurada',
          text2: 'Sincronizando dados...',
          visibilityTime: 2000
        });
      }

      return isConnected;
    } catch (error) {
      setConnectivity(prev => ({
        ...prev,
        isConnected: false,
        isChecking: false,
        lastCheck: new Date(),
        failedAttempts: prev.failedAttempts + 1
      }));

      return false;
    }
  };

  // Monitora status de sincronização
  const updateSyncStatus = async (status: Partial<typeof syncStatus>) => {
    setSyncStatus(prev => ({ ...prev, ...status }));

    // Salva último sync no storage
    if (status.lastSync) {
      await AsyncStorage.setItem('last_successful_sync', status.lastSync.toISOString());
    }
  };

  // Carrega status de sincronização do storage
  const loadSyncStatus = async () => {
    try {
      const lastSyncString = await AsyncStorage.getItem('last_successful_sync');
      const lastSync = lastSyncString ? new Date(lastSyncString) : null;
      
      setSyncStatus(prev => ({ ...prev, lastSync }));
    } catch (error) {
      console.error('Erro ao carregar status de sync:', error);
    }
  };

  // Força verificação de conectividade
  const forceConnectivityCheck = async () => {
    return await checkConnectivity();
  };

  // Verifica se os dados estão muito desatualizados
  const isDataStale = (): boolean => {
    if (!syncStatus.lastSync) return true;
    
    const now = new Date();
    const staleThreshold = 10 * 60 * 1000; // 10 minutos
    
    return (now.getTime() - syncStatus.lastSync.getTime()) > staleThreshold;
  };

  // Mostra notificação se dados estão desatualizados
  const checkStaleData = () => {
    if (isDataStale() && !connectivity.isConnected) {
      Toast.show({
        type: 'info',
        text1: '⚠️ Dados desatualizados',
        text2: 'Conecte-se à internet para sincronizar',
        visibilityTime: 4000
      });
    }
  };

  useEffect(() => {
    loadSyncStatus();
    
    // Verifica conectividade inicial
    checkConnectivity();
    
    // Verifica conectividade periodicamente
    const interval = setInterval(checkConnectivity, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Verifica dados desatualizados quando connectivity muda
    if (!connectivity.isConnected) {
      const timer = setTimeout(checkStaleData, 2000);
      return () => clearTimeout(timer);
    }
  }, [connectivity.isConnected, syncStatus.lastSync]);

  return {
    connectivity,
    syncStatus,
    checkConnectivity: forceConnectivityCheck,
    updateSyncStatus,
    isDataStale: isDataStale(),
    // Status combinado para UI
    shouldShowOfflineIndicator: !connectivity.isConnected,
    shouldShowStaleDataWarning: !connectivity.isConnected && isDataStale(),
    canPerformOnlineActions: connectivity.isConnected,
  };
}

export default useNetworkStatus;
