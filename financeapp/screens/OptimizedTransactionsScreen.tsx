import React, { memo, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, Alert, Text, TouchableOpacity } from 'react-native';
import { OptimizedTransactionList } from '../components/OptimizedTransactionList';
import { useOptimizedTransactions } from '../hooks/useOptimizedTransactions';
import { Transaction } from '../types';
import { theme } from '../theme';

/**
 * Exemplo de tela otimizada para performance
 * Demonstra como usar todas as otimizações implementadas
 */
const OptimizedTransactionsScreen = memo(() => {
  const {
    transactions,
    isLoading,
    isOperating,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions,
    getTransactionStats
  } = useOptimizedTransactions();

  // Callback memoizado para refresh
  const handleRefresh = useCallback(async () => {
    await refreshTransactions();
  }, [refreshTransactions]);

  // Callback memoizado para adicionar transação
  const handleAddTransaction = useCallback(async () => {
    const newTransaction: Omit<Transaction, 'id'> = {
      type: 'expense',
      amount: 50.00,
      title: 'Transação de Teste',
      description: 'Transação criada com otimização',
      date: new Date().toISOString(),
      categoryId: 'some-category-id',
      paymentMethod: 'cash'
    };

    await addTransaction(newTransaction);
  }, [addTransaction]);

  // Callback memoizado para editar transação
  const handleEditTransaction = useCallback(async (id: string) => {
    const updates: Partial<Transaction> = {
      amount: 75.00,
      description: 'Transação editada com otimização'
    };

    await updateTransaction(id, updates);
  }, [updateTransaction]);

  // Callback memoizado para deletar com confirmação
  const handleDeleteTransaction = useCallback(async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir esta transação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteTransaction(id)
        }
      ]
    );
  }, [deleteTransaction]);

  // Estatísticas em tempo real
  const stats = getTransactionStats();

  return (
    <View style={styles.container}>
      {/* Lista Otimizada com FlashList */}
      <OptimizedTransactionList
        transactions={transactions}
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <TransactionStats
            stats={stats}
            onAddTransaction={handleAddTransaction}
            isOperating={isOperating}
          />
        }
      />
    </View>
  );
});

/**
 * Componente de estatísticas memoizado
 */
const TransactionStats = memo<{
  stats: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
  };
  onAddTransaction: () => void;
  isOperating: boolean;
}>(({ stats, onAddTransaction, isOperating }) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Saldo</Text>
        <Text style={[
          styles.statValue,
          { color: stats.balance >= 0 ? theme.colors.success : theme.colors.error }
        ]}>
          R$ {stats.balance.toFixed(2)}
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Receitas</Text>
        <Text style={[styles.statValue, { color: theme.colors.success }]}>
          R$ {stats.totalIncome.toFixed(2)}
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Despesas</Text>
        <Text style={[styles.statValue, { color: theme.colors.error }]}>
          R$ {stats.totalExpenses.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.addButton,
          { opacity: isOperating ? 0.6 : 1 }
        ]}
        onPress={onAddTransaction}
        disabled={isOperating}
      >
        <Text style={styles.addButtonText}>
          {isOperating ? 'Adicionando...' : 'Adicionar Transação'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statTitle: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

OptimizedTransactionsScreen.displayName = 'OptimizedTransactionsScreen';

export default OptimizedTransactionsScreen;
