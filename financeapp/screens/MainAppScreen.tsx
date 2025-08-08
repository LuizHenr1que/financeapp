import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import NetworkStatusBanner from '../components/NetworkStatusBanner';
import OptimizedTransactionsScreen from './OptimizedTransactionsScreen';

/**
 * Exemplo de App principal com todas as otimizações integradas
 * Demonstra como combinar todos os sistemas de performance
 */
export default function MainAppScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Banner de status de rede - aparece apenas quando necessário */}
      <NetworkStatusBanner />
      
      {/* Tela principal com todas as otimizações */}
      <OptimizedTransactionsScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
