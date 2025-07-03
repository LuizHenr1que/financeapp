import React, { forwardRef, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Card } from './Card';
import { theme } from '@/theme';
import { ChevronRight } from 'lucide-react-native';
import { View as RNView } from 'react-native';
import { Input } from './Input';
import { CreditCard } from 'lucide-react-native';
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
    const [selectedCardIcon, setSelectedCardIcon] = useState('');
    const selectCardIconModalRef = useRef<Modalize>(null);
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
      // Se veio por parâmetro (web/deep link)
      if (params.selectedAccount) {
        setForm(f => ({ ...f, account: String(params.selectedAccount) }));
        setStep('manual');
        modalizeRef.current?.open();
      }
      // Se veio por variável global (navegação interna)
      if (typeof window !== 'undefined' && window.selectedAccountTemp) {
        setForm(f => ({ ...f, account: String(window.selectedAccountTemp) }));
        setStep('manual');
        modalizeRef.current?.open();
        window.selectedAccountTemp = undefined;
      }
    }, [params.selectedAccount]);
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
              cardButtonStyle={styles.cardButton}
              disabledCardButtonStyle={styles.disabledCardButton}
              buttonStyle={styles.button}
              buttonContentStyle={styles.buttonContent}
              buttonDescStyle={styles.buttonDesc}
            />
          ) : (
            <>
              <Text style={styles.title}>Criar novo cartão</Text>
              {/* Input select de conta de pagamento com label em cima */}
              <Text style={styles.inputLabel}>Conta de pagamento</Text>
              <TouchableOpacity
                style={[styles.selectInput, { marginBottom: 16 }]}
                onPress={() => {
                  // Navega para a tela de contas e espera o retorno, passando returnTo
                  router.push({ pathname: '/accounts', params: { selectMode: 'true', returnTo: '/add' } });
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
                  {selectedCardIcon
                    ? cardIcons.find(i => i.label === selectedCardIcon)?.icon
                    : null}
                  <Text style={{ color: selectedCardIcon ? theme.colors.text : theme.colors.textSecondary, fontSize: 16, marginLeft: selectedCardIcon ? 8 : 0 }}>
                    {selectedCardIcon ? selectedCardIcon : 'Selecione ícone do cartão'}
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
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]} onPress={() => { onManualPress(); handleCancel(); }}>
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
        <Modalize
          ref={selectCardIconModalRef}
          modalHeight={400}
          handleStyle={{ backgroundColor: theme.colors.border }}
          modalStyle={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}
        >
          <Text style={styles.title}>Selecionar ícone do cartão</Text>
          {cardIcons.map(icon => (
            <TouchableOpacity
              key={icon.label}
              style={styles.accountOption}
              onPress={() => {
                setSelectedCardIcon(icon.label);
                selectCardIconModalRef.current?.close();
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {icon.icon}
                <Text style={{ marginLeft: 12, fontSize: 16, color: theme.colors.text }}>{icon.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Modalize>
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
    textAlign: 'left', // alinhado à esquerda
    marginBottom: 24,
    fontWeight: '600',
  },
  cardButton: {
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 0,
  },
  disabledCardButton: {
    // para reforçar visual de desabilitado
    backgroundColor: theme.colors.surface,
    // pode adicionar sombra/blur se desejar, mas React Native puro não tem blur nativo
    // para efeito de blur real, seria necessário usar expo-blur ou similar
  },
  button: {
    padding: 20,
    alignItems: 'flex-start',
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  buttonDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'left', // alinhado à esquerda
    opacity: 0.8,
    width: '100%',
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
  accountOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
