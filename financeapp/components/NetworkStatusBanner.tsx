import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { theme } from '../theme';

/**
 * Componente que mostra status de conectividade e sincronização
 * Aparece apenas quando há problemas ou informações importantes
 */
export const NetworkStatusBanner = memo(() => {
  const {
    connectivity,
    syncStatus,
    checkConnectivity,
    shouldShowOfflineIndicator,
    shouldShowStaleDataWarning,
    canPerformOnlineActions
  } = useNetworkStatus();

  // Não mostra nada se tudo estiver ok
  if (canPerformOnlineActions && !shouldShowStaleDataWarning) {
    return null;
  }

  const handleRetryConnection = async () => {
    await checkConnectivity();
  };

  const getStatusInfo = () => {
    if (!connectivity.isConnected) {
      return {
        icon: '📡',
        title: 'Sem conexão',
        message: 'Você está trabalhando offline',
        backgroundColor: theme.colors.warning,
        textColor: '#fff',
        showRetry: true
      };
    }

    if (shouldShowStaleDataWarning) {
      return {
        icon: '⚠️',
        title: 'Dados desatualizados',
        message: 'Última sincronização há mais de 10 minutos',
        backgroundColor: theme.colors.info,
        textColor: '#fff',
        showRetry: false
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <View style={[styles.banner, { backgroundColor: statusInfo.backgroundColor }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{statusInfo.icon}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: statusInfo.textColor }]}>
            {statusInfo.title}
          </Text>
          <Text style={[styles.message, { color: statusInfo.textColor }]}>
            {statusInfo.message}
          </Text>
          {syncStatus.lastSync && (
            <Text style={[styles.lastSync, { color: statusInfo.textColor }]}>
              Último sync: {syncStatus.lastSync.toLocaleTimeString('pt-BR')}
            </Text>
          )}
        </View>
        {statusInfo.showRetry && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetryConnection}
            disabled={connectivity.isChecking}
          >
            <Text style={styles.retryText}>
              {connectivity.isChecking ? '⏳' : '🔄'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

/**
 * Componente compacto para mostrar apenas o ícone de status
 * Útil para headers ou barras de ferramentas
 */
export const NetworkStatusIcon = memo(() => {
  const { connectivity, canPerformOnlineActions } = useNetworkStatus();

  if (canPerformOnlineActions) {
    return (
      <View style={styles.statusIcon}>
        <Text style={styles.iconText}>✅</Text>
      </View>
    );
  }

  return (
    <View style={[styles.statusIcon, styles.offlineIcon]}>
      <Text style={styles.iconText}>
        {connectivity.isChecking ? '⏳' : '📡'}
      </Text>
    </View>
  );
});

/**
 * Hook para obter indicador de status simples
 */
export const useNetworkIndicator = () => {
  const { connectivity, canPerformOnlineActions } = useNetworkStatus();

  return {
    isOnline: canPerformOnlineActions,
    isChecking: connectivity.isChecking,
    failedAttempts: connectivity.failedAttempts,
    statusEmoji: canPerformOnlineActions ? '✅' : connectivity.isChecking ? '⏳' : '📡',
    statusText: canPerformOnlineActions ? 'Online' : connectivity.isChecking ? 'Verificando...' : 'Offline'
  };
};

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    opacity: 0.9,
  },
  lastSync: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 2,
  },
  retryButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  retryText: {
    fontSize: 16,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineIcon: {
    backgroundColor: theme.colors.warning,
  },
  iconText: {
    fontSize: 12,
  },
});

NetworkStatusBanner.displayName = 'NetworkStatusBanner';
NetworkStatusIcon.displayName = 'NetworkStatusIcon';

export default NetworkStatusBanner;
