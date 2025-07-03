import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { theme } from '@/theme';
import { Card } from '@/components/Card';
import { Plus, Banknote } from 'lucide-react-native';

const mockAccounts = [
  {
    id: '1',
    name: 'Conta Corrente Banco XPTO',
    number: '12345-6',
    agency: '0001',
    balance: 2500.75,
  },
];

export default function AccountsScreen() {
  const handleAddAccount = () => {
    // Aqui você pode abrir um modal ou navegar para uma tela de cadastro
    alert('Adicionar nova conta (mock)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Contas</Text>
      <FlatList
        data={mockAccounts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.accountCard}>
            <View style={styles.accountInfo}>
              <Banknote size={32} color={theme.colors.primary} style={{ marginRight: theme.spacing.md }} />
              <View>
                <Text style={styles.accountName}>{item.name}</Text>
                <Text style={styles.accountDetails}>Agência: {item.agency}   Conta: {item.number}</Text>
                <Text style={styles.accountBalance}>Saldo: R$ {item.balance.toFixed(2)}</Text>
              </View>
            </View>
          </Card>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
            <Plus size={24} color={theme.colors.primary} />
            <Text style={styles.addButtonText}>Adicionar Conta</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  accountCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountName: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  accountDetails: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  accountBalance: {
    fontSize: theme.typography.medium,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    marginTop: theme.spacing.lg,
  },
  addButtonText: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
});
