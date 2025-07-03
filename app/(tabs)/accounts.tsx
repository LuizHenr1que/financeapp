import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Plus, Banknote, ChevronRight, CreditCard, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const mockAccounts = [
  {
    id: '1',
    name: 'Carteira',
    balance: 2500.75,
  },
];

export default function AccountsScreen() {
  const handleAddAccount = () => {
    // Aqui você pode abrir um modal ou navegar para uma tela de cadastro
    alert('Adicionar nova conta (mock)');
  };
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Passa a prop onBackPress para exibir o botão de voltar apenas nesta página */}
      <Header
        type="cards"
        onBackPress={() => router.back()}
        onViewPress={() => {}}
        onFilterPress={() => {}}
        onSearchPress={() => {}}
      />
      <ScrollView style={styles.content}>
        <Card style={styles.addButtonCard}>
          <TouchableOpacity onPress={handleAddAccount} style={styles.addAccountButton}>
            <Plus size={24} color={theme.colors.primary} />
            <Text style={styles.addAccountText}>Adicionar Conta</Text>
          </TouchableOpacity>
        </Card>
        {mockAccounts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Banknote size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhuma conta cadastrada</Text>
            <Text style={styles.emptyText}>
              Adicione sua primeira conta para começar a organizar suas finanças
            </Text>
          </Card>
        ) : (
          mockAccounts.map(account => (
            <Card key={account.id} style={styles.accountCardCustom}>
              {/* Linha 1: Ícone de círculo com carteira, nome da conta e saldo */}
              <View style={styles.cardTopRow}>
                <View style={styles.circleIcon}>
                  <CreditCard size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.accountNameCustom}>{account.name}</Text>
                <View style={styles.saldoContainer}>
                  <Text style={styles.saldoLabel}>Saldo de</Text>
                  <Text style={styles.saldoValue}>R$ {account.balance.toFixed(2)}</Text>
                </View>
              </View>
            </Card>
          ))
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
  addAccountButton: {
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
  addAccountText: {
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
  accountCardCustom: {
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md, 
    paddingHorizontal: theme.spacing.lg, 
    backgroundColor: theme.colors.surface,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  accountNameCustom: {
    flex: 1,
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  circleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  saldoContainer: {
    alignItems: 'flex-end',
  },
  saldoLabel: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  saldoValue: {
    fontSize: theme.typography.medium,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  closeDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeDate: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.small,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  payButtonText: {
    color: theme.colors.title,
    fontWeight: 'bold',
    fontSize: theme.typography.medium,
  },
});
