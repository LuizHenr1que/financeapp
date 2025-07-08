import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Plus, Banknote, ChevronRight, CreditCard, Calendar } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Modalize } from 'react-native-modalize';
import { AddCardMethodOptions } from '@/components/AddCardMethodOptions';
import { AddAccountManualModal, AddAccountManualModalRef } from '@/components/AddAccountManualModal';
import api from '@/src/services/api';
import authService from '@/src/services/auth';
import { useAuth } from '@/context/AuthContext';

export default function AccountsScreen() {
  const modalizeRef = useRef<Modalize>(null);
  const manualModalRef = useRef<AddAccountManualModalRef>(null);
  const [step, setStep] = useState<'manual' | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAccounts = async () => {
    const token = await authService.getToken();
    if (!token) return;
    setLoading(true);
    const res = await api.get<{ accounts: any[] }>('/accounts', token);
    if (res.data && res.data.accounts) {
      setAccounts(res.data.accounts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const handleAddAccount = () => {
    setStep(null);
    setTimeout(() => modalizeRef.current?.open(), 10);
  };
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectMode = params.selectMode === 'true';

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
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 32 }}>Carregando contas...</Text>
        ) : accounts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Banknote size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhuma conta cadastrada</Text>
            <Text style={styles.emptyText}>
              Adicione sua primeira conta para começar a organizar suas finanças
            </Text>
          </Card>
        ) : (
          accounts.map(account => (
            <Card key={account.id} style={styles.accountCardCustom}>
              <TouchableOpacity
                disabled={!selectMode}
                onPress={() => {
                  if (selectMode) {
                    router.replace({ pathname: '/cards', params: { selectedAccount: account.name } });
                  }
                }}
                style={{ flex: 1 }}
                activeOpacity={selectMode ? 0.7 : 1}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.circleIcon}>
                    <CreditCard size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.accountNameCustom}>{account.name}</Text>
                  <View style={styles.saldoContainer}>
                    <Text style={styles.saldoLabel}>Saldo de</Text>
                    <Text style={styles.saldoValue}>R$ {Number(account.balance || 0).toFixed(2)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Card>
          ))
        )}
      </ScrollView>
      <Modalize
        ref={modalizeRef}
        modalHeight={320}
        handleStyle={{ backgroundColor: theme.colors.border }}
        modalStyle={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}
        onClose={() => setStep(null)}
      >
        <AddCardMethodOptions
          title="Como você deseja cadastrar sua nova conta bancária?"
          manualTitle="Conta manual"
          manualDesc="Cadastre suas transações manualmente"
          openFinanceTitle="Open Finance"
          openFinanceDesc="Em breve: conecte sua conta via Open Finance"
          onManualPress={() => {
            console.log('Conta manual clicada');
            setStep('manual');
            setTimeout(() => {
              modalizeRef.current?.close();
              manualModalRef.current?.open();
            }, 300);
          }}
        />
      </Modalize>
      <AddAccountManualModal ref={manualModalRef} onAccountCreated={fetchAccounts} />
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
