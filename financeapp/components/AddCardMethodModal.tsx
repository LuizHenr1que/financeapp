import React, { forwardRef, useState, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Card } from './Card';
import { theme } from '@/theme';
import { ChevronRight } from 'lucide-react-native';
import { View as RNView, Image } from 'react-native';
import { Input } from './Input';
import { CreditCard } from 'lucide-react-native';
import { AccountIconSelectorModal, AccountIconSelectorModalRef, AccountIconOption } from './AccountIconSelectorModal';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AddCardMethodOptions } from './AddCardMethodOptions';

// Adiciona tipagem global para selectedAccountTemp
// @ts-ignore
// eslint-disable-next-line
declare global {
  interface Window { selectedAccountTemp?: string }
}

export type AddCardMethodModalProps = {
  onManualPress: () => void;
  onOpenFinancePress: () => void;
};

export const AddCardMethodModal = forwardRef<any, AddCardMethodModalProps>(
  ({ onManualPress, onOpenFinancePress }, ref) => {
    const modalizeRef = React.useRef<Modalize>(null);
    const selectAccountModalRef = useRef<Modalize>(null);
    const [step, setStep] = useState<'choose' | 'manual'>('choose');
    const [form, setForm] = useState({
      account: '',
      name: '',
      limit: '',
      closingDay: '',
      dueDay: '',
    });
    // Exemplo de contas
    const accounts = [
      { name: 'Nubank', icon: <CreditCard size={24} color={theme.colors.primary} /> },
      { name: 'Itaú', icon: <CreditCard size={24} color={theme.colors.primary} /> },
      { name: 'Inter', icon: <CreditCard size={24} color={theme.colors.primary} /> },
      { name: 'Caixa', icon: <CreditCard size={24} color={theme.colors.primary} /> },
    ];
    // Exemplo de ícones de cartão
    const cardIcons = [
      { label: 'Cartão Azul', icon: <CreditCard size={24} color={'#2196f3'} /> },
      { label: 'Cartão Verde', icon: <CreditCard size={24} color={'#43a047'} /> },
      { label: 'Cartão Roxo', icon: <CreditCard size={24} color={'#8e24aa'} /> },
      { label: 'Cartão Laranja', icon: <CreditCard size={24} color={'#fb8c00'} /> },
    ];
    const [selectedCardIcon, setSelectedCardIcon] = useState<{ label: string; icon: React.ReactNode } | null>(null);
    const selectCardIconModalRef = useRef<AccountIconSelectorModalRef>(null);
    const handleCancel = () => {
      setStep('choose');
      setForm({ account: '', name: '', limit: '', closingDay: '', dueDay: '' });
    };
    const selectClosingDayModalRef = useRef<Modalize>(null);
    const selectDueDayModalRef = useRef<Modalize>(null);
    const [selectedClosingDay, setSelectedClosingDay] = useState('');
    const [selectedDueDay, setSelectedDueDay] = useState('');
    // Seleciona o dia atual por padrão ao abrir os selects de dia
    const handleOpenClosingDay = () => {
      setSelectedClosingDay(prev => prev || new Date().getDate().toString());
      selectClosingDayModalRef.current?.open();
    };
    const handleOpenDueDay = () => {
      setSelectedDueDay(prev => prev || new Date().getDate().toString());
      selectDueDayModalRef.current?.open();
    };
    const router = useRouter();
    const params = useLocalSearchParams();
    // Preencher o campo ao retornar da tela de contas
    React.useEffect(() => {
      if (params.selectedAccount) {
        setForm(f => ({ ...f, account: String(params.selectedAccount) }));
        setStep('manual');
        modalizeRef.current?.open();
      }
    }, [params.selectedAccount]);

    useFocusEffect(
      React.useCallback(() => {
        // Nenhuma lógica de window, apenas params.selectedAccount já cobre o caso
      }, [])
    );
    React.useImperativeHandle(ref, () => ({
      open: () => { setStep('choose'); modalizeRef.current?.open(); },
      close: () => { setStep('choose'); modalizeRef.current?.close(); },
      openManual: () => { setStep('manual'); modalizeRef.current?.open(); },
    }));
    return (
      <>
        <Modalize
          ref={modalizeRef}
          modalHeight={step === 'choose' ? 320 : 600}
          handleStyle={{ backgroundColor: theme.colors.border }}
          modalStyle={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}
          onClose={handleCancel}
        >
          {step === 'choose' ? (
            <AddCardMethodOptions
              title="Como você deseja cadastrar seu novo cartão de crédito?"
              manualTitle="Cartão de crédito manual"
              manualDesc="Cadastre suas transações manualmente"
              openFinanceTitle="Open Finance"
              openFinanceDesc="Em breve: conecte seu cartão via Open Finance"
              onManualPress={() => {
                setStep('manual');
                setTimeout(() => modalizeRef.current?.open(), 10);
              }}
            
            />
          ) : (
            <>
              <Text style={styles.title}>Criar novo cartão</Text>
              {/* Input select de conta de pagamento com label em cima */}
              <Text style={styles.inputLabel}>Conta de pagamento</Text>
              <TouchableOpacity
                style={[styles.selectInput, { marginBottom: 16 }]}
                onPress={() => {
                  router.push({ pathname: '/accounts', params: { selectMode: 'true' } });
                }}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  {form.account ? (
                    <CreditCard size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  ) : null}
                  <Text style={{ color: form.account ? theme.colors.text : theme.colors.textSecondary, fontSize: 16 }}>
                    {form.account ? form.account : 'Selecione conta de pagamento'}
                  </Text>
                </View>
                <ChevronRight size={22} color={theme.colors.primary} />
              </TouchableOpacity>
              {/* Input select de ícone do cartão com label em cima */}
              <Text style={styles.inputLabel}>Ícone do cartão</Text>
              <TouchableOpacity
                style={[styles.selectInput, { marginBottom: 16 }]}
                onPress={() => selectCardIconModalRef.current?.open()}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  {selectedCardIcon?.icon}
                  <Text style={{ color: selectedCardIcon ? theme.colors.text : theme.colors.textSecondary, fontSize: 16, marginLeft: selectedCardIcon ? 8 : 0 }}>
                    {selectedCardIcon ? selectedCardIcon.label : 'Selecione ícone do cartão'}
                  </Text>
                </View>
                <ChevronRight size={22} color={theme.colors.primary} />
              </TouchableOpacity>
              {/* Inputs normais */}
              <Input
                label="Nome do cartão"
                value={form.name}
                onChangeText={text => setForm(f => ({ ...f, name: text }))}
                placeholder="Ex: Cartão Principal"
                style={{ marginBottom: 16 }}
              />
              <Input
                label="Limite total (R$)"
                value={form.limit}
                onChangeText={text => setForm(f => ({ ...f, limit: text }))}
                placeholder="0,00"
                keyboardType="numeric"
                style={{ marginBottom: 16 }}
              />
              {/* Selects de Fecha dia e Vence dia */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Fecha dia</Text>
                  <TouchableOpacity
                    style={styles.selectInput}
                    onPress={handleOpenClosingDay}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: selectedClosingDay ? theme.colors.text : theme.colors.textSecondary, fontSize: 16 }}>
                      {selectedClosingDay ? selectedClosingDay : 'Selecione o dia'}
                    </Text>
                    <ChevronRight size={22} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Vence dia</Text>
                  <TouchableOpacity
                    style={styles.selectInput}
                    onPress={handleOpenDueDay}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: selectedDueDay ? theme.colors.text : theme.colors.textSecondary, fontSize: 16 }}>
                      {selectedDueDay ? selectedDueDay : 'Selecione o dia'}
                    </Text>
                    <ChevronRight size={22} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, paddingHorizontal: 5 }}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderWidth: 1 }]} onPress={handleCancel}>
                  <Text style={[styles.actionBtnText, { color: theme.colors.primary }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]} onPress={() => {
                  // Chama a função de salvar cartão no backend com token de autenticação
                  import('../src/services/auth').then(({ default: authService }) => {
                    authService.getToken().then(token => {
                      if (!token) {
                        alert('Usuário não autenticado. Faça login novamente.');
                        return;
                      }
                      import('../src/services/card').then(({ default: CardService }) => {
                        // Campos obrigatórios para o backend: name, type, icon, limit, closingDay, dueDay
                        const payload = {
                          name: form.name,
                          type: 'credit', // valor padrão
                          icon: selectedCardIcon?.label || '',
                          limit: form.limit,
                          closingDay: selectedClosingDay ? Number(selectedClosingDay) : null,
                          dueDay: selectedDueDay ? Number(selectedDueDay) : null,
                        };
                        console.log('🟢 Enviando para backend (criar cartão):', payload);
                        CardService.createCard(payload, token).then(() => {
                          handleCancel(); // Fecha o modal após salvar
                        });
                      });
                    });
                  });
                }}>
                  <Text style={[styles.actionBtnText, { color: theme.colors.surface }]}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Modalize>
        {/* Modal de seleção de conta/cartão */}
        <Modalize
          ref={selectAccountModalRef}
          modalHeight={400}
          handleStyle={{ backgroundColor: theme.colors.border }}
          modalStyle={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}
        >
          <Text style={styles.title}>Selecionar conta</Text>
          {accounts.map(acc => (
            <TouchableOpacity
              key={acc.name}
              style={styles.accountOption}
              onPress={() => {
                setForm(f => ({ ...f, account: acc.name }));
                selectAccountModalRef.current?.close();
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {acc.icon}
                <Text style={{ marginLeft: 12, fontSize: 16, color: theme.colors.text }}>{acc.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Modalize>
        {/* Modal de seleção de ícone do cartão */}
        <AccountIconSelectorModal
          ref={selectCardIconModalRef}
          onSelect={icon => {
            let iconNode: React.ReactNode = null;
            if (icon.image) {
              iconNode = <Image source={icon.image} style={{ width: 24, height: 24, marginRight: 8 }} resizeMode="contain" />;
            } else if (icon.emoji) {
              iconNode = <Text style={{ fontSize: 24, marginRight: 8 }}>{icon.emoji}</Text>;
            } else {
              iconNode = <CreditCard size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />;
            }
            setSelectedCardIcon({ label: icon.label, icon: iconNode });
          }}
          title="Selecionar ícone"
        />
        {/* Modal de seleção de Fecha dia */}
        <Modalize
          ref={selectClosingDayModalRef}
          modalHeight={400}
          handleStyle={{ backgroundColor: theme.colors.border }}
          modalStyle={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}
        >
          <Text style={{ fontSize: 22, color: theme.colors.text, textAlign: 'center', fontWeight: '400', marginBottom: 24 }}>
            Selecionar <Text style={{ fontWeight: 'bold' }}>Fecha dia</Text>
          </Text>
          <View style={{ flex: 1, height: '100%' }}>
            <ScrollView style={{ maxHeight: 250 }} contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(item => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setSelectedClosingDay(item.toString())}
                  style={{ marginVertical: 6, alignItems: 'center', justifyContent: 'center', width: 100 }}
                >
                  <Text style={{
                    fontSize: selectedClosingDay === item.toString() ? 28 : 20,
                    color: selectedClosingDay === item.toString() ? theme.colors.primary : theme.colors.textSecondary,
                    fontWeight: selectedClosingDay === item.toString() ? 'bold' : 'normal',
                    opacity: selectedClosingDay === item.toString() ? 1 : 0.6,
                  }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={{ minWidth: 180, borderRadius: 24, alignSelf: 'center', marginTop: 16, height: 48, justifyContent: 'center', backgroundColor: theme.colors.primary }}
              onPress={() => selectClosingDayModalRef.current?.close()}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.surface, textAlign: 'center' }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </Modalize>
        {/* Modal de seleção de Vence dia */}
        <Modalize
          ref={selectDueDayModalRef}
          modalHeight={400}
          handleStyle={{ backgroundColor: theme.colors.border }}
          modalStyle={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}
        >
          <Text style={{ fontSize: 22, color: theme.colors.text, textAlign: 'center', fontWeight: '400', marginBottom: 24 }}>
            Selecionar <Text style={{ fontWeight: 'bold' }}>Vence dia</Text>
          </Text>
          <View style={{ flex: 1, height: '100%' }}>
            <ScrollView style={{ maxHeight: 250 }} contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(item => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setSelectedDueDay(item.toString())}
                  style={{ marginVertical: 6, alignItems: 'center', justifyContent: 'center', width: 100 }}
                >
                  <Text style={{
                    fontSize: selectedDueDay === item.toString() ? 28 : 20,
                    color: selectedDueDay === item.toString() ? theme.colors.primary : theme.colors.textSecondary,
                    fontWeight: selectedDueDay === item.toString() ? 'bold' : 'normal',
                    opacity: selectedDueDay === item.toString() ? 1 : 0.6,
                  }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={{ minWidth: 180, borderRadius: 24, alignSelf: 'center', marginTop: 16, height: 48, justifyContent: 'center', backgroundColor: theme.colors.primary }}
              onPress={() => selectDueDayModalRef.current?.close()}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.surface, textAlign: 'center' }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </Modalize>
      </>
    );
  }
);

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: theme.colors.text,
    textAlign: 'left',
    marginBottom: 24,
    fontWeight: '600',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 6,
    fontWeight: '500',
    marginLeft: 2,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
