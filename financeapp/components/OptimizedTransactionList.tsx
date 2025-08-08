import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Trash2, Edit3, ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';
import { Transaction } from '@/types';
import { theme } from '@/theme';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

// Componente memoizado para item da transação
const TransactionItem = memo<TransactionItemProps>(({ transaction, onEdit, onDelete }) => {
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta transação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => onDelete(transaction.id)
        }
      ]
    );
  }, [transaction.id, onDelete]);

  const handleEdit = useCallback(() => {
    onEdit(transaction);
  }, [transaction, onEdit]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  }, []);

  const isIncome = transaction.type === 'income';
  
  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        {isIncome ? (
          <ArrowUpCircle size={24} color={theme.colors.success} />
        ) : (
          <ArrowDownCircle size={24} color={theme.colors.error} />
        )}
      </View>
      
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.date)}
        </Text>
        {transaction.description && (
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {transaction.description}
          </Text>
        )}
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: isIncome ? theme.colors.success : theme.colors.error }
        ]}>
          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
        </Text>
      </View>
      
      <View style={styles.transactionActions}>
        <TouchableOpacity
          onPress={handleEdit}
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Edit3 size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

TransactionItem.displayName = 'TransactionItem';

interface OptimizedTransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

// Componente principal da lista otimizada
export const OptimizedTransactionList = memo<OptimizedTransactionListProps>(({
  transactions,
  loading,
  refreshing,
  hasMore,
  onRefresh,
  onLoadMore,
  onEdit,
  onDelete
}) => {
  const renderTransaction = useCallback(({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ), [onEdit, onDelete]);

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!loading || refreshing) return null;
    
    return (
      <View style={styles.footer}>
        <Text style={styles.loadingText}>Carregando mais transações...</Text>
      </View>
    );
  }, [loading, refreshing]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
      <Text style={styles.emptySubtext}>
        Adicione sua primeira transação tocando no botão +
      </Text>
    </View>
  ), []);

  const handleEndReached = useCallback(() => {
    if (hasMore && !loading && !refreshing) {
      onLoadMore();
    }
  }, [hasMore, loading, refreshing, onLoadMore]);

  return (
    <View style={styles.container}>
      <FlashList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={keyExtractor}
        estimatedItemSize={80}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        // Otimizações de performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        getItemType={() => 'transaction'}
        // Cache de células renderizadas
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
    </View>
  );
});

OptimizedTransactionList.displayName = 'OptimizedTransactionList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginVertical: 4,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.small,
  },
  transactionIcon: {
    marginRight: theme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
    marginRight: theme.spacing.sm,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
