import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Plus, Edit3, Trash2, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react-native';
import { theme } from '@/theme';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Header } from '@/components/Header';
import { Transaction, Category, Card as CardType } from '@/types';
import { useRouter } from 'expo-router';

export default function TransactionsScreen() {
  const { data, updateTransaction, deleteTransaction } = useData();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const router = useRouter();

  const handleViewPress = () => {
    console.log('Visualização pressionada');
  };

  const handleFilterPress = () => {
    console.log('Filtro pressionado');
  };

  const handleSearchPress = () => {
    console.log('Busca pressionada');
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    // Aqui você pode navegar para uma tela de edição, se desejar
  };

  const handleDelete = (transactionId: string) => {
    Alert.alert(
      'Excluir Transação',
      'Tem certeza que deseja excluir esta transação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteTransaction(transactionId),
        },
      ]
    );
  };

  const getCategory = (categoryId: string): Category | undefined => {
    return data.categories.find(cat => cat.id === categoryId);
  };

  const getCard = (cardId: string): CardType | undefined => {
    return data.cards.find(card => card.id === cardId);
  };

  const sortedTransactions = [...data.transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'pix': return 'PIX';
      case 'card': return 'Cartão';
      default: return method;
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        type="transactions"
        onViewPress={handleViewPress}
        onFilterPress={handleFilterPress}
        onSearchPress={handleSearchPress}
      />
      <ScrollView style={styles.content}>
        {/* Add Transaction Button */}
        <Card style={styles.addButtonCard}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/addTransaction')}
            style={styles.addTransactionButton}
          >
            <Plus size={24} color={theme.colors.primary} />
            <Text style={styles.addTransactionText}>Adicionar Nova Transação</Text>
          </TouchableOpacity>
        </Card>
        {/* Transactions List */}
        {sortedTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <DollarSign size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhuma transação</Text>
            <Text style={styles.emptyText}>
              Adicione sua primeira transação para começar a acompanhar suas finanças
            </Text>
          </Card>
        ) : (
          sortedTransactions.map(transaction => {
            const category = getCategory(transaction.categoryId);
            const card = transaction.cardId ? getCard(transaction.cardId) : null;
            return (
              <Card key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <View style={styles.transactionMain}>
                      <View style={styles.transactionIcon}>
                        {transaction.type === 'income' ? (
                          <TrendingUp size={20} color={theme.colors.income} />
                        ) : (
                          <TrendingDown size={20} color={theme.colors.expense} />
                        )}
                      </View>
                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionDescription}>
                          {transaction.description}
                        </Text>
                        <View style={styles.transactionMeta}>
                          <Text style={styles.transactionCategory}>
                            {category?.name || 'Categoria removida'}
                          </Text>
                          <Text style={styles.transactionDate}>
                            {formatDate(transaction.date)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'income' ? theme.colors.income : theme.colors.expense }
                    ]}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {(Number(transaction.amount) || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.transactionActions}>
                    <TouchableOpacity
                      onPress={() => handleEdit(transaction)}
                      style={styles.actionButton}
                    >
                      <Edit3 size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(transaction.id)}
                      style={styles.actionButton}
                    >
                      <Trash2 size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.transactionFooter}>
                  <Text style={styles.paymentMethod}>
                    {formatPaymentMethod(transaction.paymentMethod)}
                  </Text>
                  {card && (
                    <Text style={styles.cardName}>
                      {card.name}
                    </Text>
                  )}
                  {transaction.installments && transaction.installments > 1 && (
                    <Text style={styles.installments}>
                      {transaction.currentInstallment || 1}/{transaction.installments}x
                    </Text>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  addButtonCard: {
    marginBottom: theme.spacing.lg,
  },
  addTransactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  addTransactionText: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  transactionItem: {
    marginBottom: theme.spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  transactionInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  transactionMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  transactionIcon: {
    marginRight: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionCategory: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
  transactionDate: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
  transactionAmount: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  transactionActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  paymentMethod: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  cardName: {
    fontSize: theme.typography.small,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  installments: {
    fontSize: theme.typography.small,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  typeRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.text,
  },
  typeButtonTextActive: {
    color: theme.colors.title,
  },
  categoryScroll: {
    marginBottom: theme.spacing.lg,
  },
  categoryOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginRight: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryOptionSelected: {
    borderColor: theme.colors.text,
  },
  categoryOptionText: {
    fontSize: theme.typography.small,
    fontWeight: '600',
    color: theme.colors.title,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  paymentButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  paymentButtonText: {
    fontSize: theme.typography.small,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentButtonTextActive: {
    color: theme.colors.title,
  },
  cardOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginRight: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardOptionSelected: {
    borderColor: theme.colors.text,
  },
  cardOptionText: {
    fontSize: theme.typography.small,
    fontWeight: '600',
    color: theme.colors.title,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
  editHeader: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editTitle: {
    fontSize: theme.typography.title,
    fontWeight: 'bold',
    color: theme.colors.title,
  },
  closeButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  closeButtonText: {
    fontSize: theme.typography.medium,
    color: theme.colors.title,
    fontWeight: '500',
  },
});