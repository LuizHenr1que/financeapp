import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { theme } from '@/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Plus, Banknote, ChevronRight, CreditCard, Calendar } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Modalize } from 'react-native-modalize';
import { AddCardMethodOptions } from '@/components/AddCardMethodOptions';
import { AddAccountManualModal, AddAccountManualModalRef } from '@/components/AddAccountManualModal';
import { AccountOptionsModal, AccountOptionsModalRef } from '@/components/AccountOptionsModal';
import api from '@/src/services/api';
import authService from '@/src/services/auth';
import { useAuth } from '@/context/AuthContext';
import { ICONS } from '@/components/AccountIconSelectorModal';
import Toast from 'react-native-toast-message';

export default function AccountsScreen() {
  const modalizeRef = useRef<Modalize>(null);
  const manualModalRef = useRef<AddAccountManualModalRef>(null);
  const [step, setStep] = useState<'manual' | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [accountOptionsModalVisible, setAccountOptionsModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [includeInTotal, setIncludeInTotal] = useState(true);
  const accountOptionsModalRef = useRef<AccountOptionsModalRef>(null);

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
        type="accounts"
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
                onPress={() => {
                  if (selectMode) {
                    router.replace({ pathname: '/cards', params: { selectedAccount: account.name } });
                  } else {
                    setSelectedAccount(account);
                    setIncludeInTotal(account.includeInTotal !== false); // default true
                    setTimeout(() => accountOptionsModalRef.current?.open(), 10);
                  }
                }}
                style={{ flex: 1 }}
                activeOpacity={0.7}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.circleIcon}>
                    {(() => {
                      const iconData = ICONS.find(i => i.key === account.icon || i.label === account.icon);
                      if (iconData?.image) {
                        return (
                          <Image
                            source={iconData.image}
                            style={{ width: 25, height: 25 }}
                            resizeMode="contain"
                          />
                        );
                      } else if (iconData?.emoji) {
                        return (
                          <Text style={{ fontSize: 25 }}>{iconData.emoji}</Text>
                        );
                      } else {
                        return (
                          <Text style={{ fontSize: 25 }}>💳</Text>
                        );
                      }
                    })()}
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
      <AccountOptionsModal
        ref={accountOptionsModalRef}
        selectedAccount={selectedAccount}
        includeInTotal={includeInTotal}
        setIncludeInTotal={setIncludeInTotal}
        onClose={() => setSelectedAccount(null)}
        onEdit={async (balanceInput?: string) => {
          if (!selectedAccount) return;
          setLoading(true);
          const res = await import('@/src/services/data').then(m => m.default.updateAccount(
            selectedAccount.id,
            {
              balance: Number(balanceInput ?? selectedAccount.balance),
              includeInTotal,
              name: selectedAccount.name,
              type: selectedAccount.type,
              color: selectedAccount.color,
              icon: selectedAccount.icon
            }
          ));
          await fetchAccounts();
          setLoading(false);
          accountOptionsModalRef.current?.close();
          Toast.show({ type: res.error ? 'error' : 'success', text1: typeof res.error === 'string' ? res.error : (typeof res.message === 'string' ? res.message : 'Conta editada!') });
        }}
        onDelete={async () => {
          if (!selectedAccount) return;
          setLoading(true);
          const res = await import('@/src/services/data').then(m => m.default.deleteAccount(selectedAccount.id));
          await fetchAccounts();
          setLoading(false);
          accountOptionsModalRef.current?.close();
          Toast.show({ type: res.error ? 'error' : 'success', text1: typeof res.error === 'string' ? res.error : (typeof res.message === 'string' ? res.message : 'Conta excluída!') });
        }}
      />
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
    paddingVertical: theme.spacing.sm, 
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
    paddingLeft: theme.spacing.md,
  },
  circleIcon: {
     width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  // Estilos para o modal de opções da conta, igual ao AddAccountManualModal
  optionsModalContainer: {
    padding: 24,
  },
  optionsTitle: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'left',
  },
  optionsCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  optionsCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: theme.colors.background,
  },
  optionsCheckboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  optionsCheckboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.title,
  },
  optionsCheckboxLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  optionsSaldo: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'left',
  },
  optionsSaldoBold: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  optionsButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  optionsButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginTop: 8,
  },
  optionsButtonCancel: {
    backgroundColor: theme.colors.border,
  },
  optionsButtonText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  optionsButtonTextCancel: {
    color: theme.colors.text,
  },
});
