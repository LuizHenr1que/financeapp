import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Platform,
  FlatList,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransactionTypeModal from '@/components/TransactionTypeModal';
import { theme } from '@/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import InputLogin from '@/components/InputLogin';
import { Modalize } from 'react-native-modalize';
import { Calendar } from 'react-native-calendars';

// Função utilitária para data local no formato YYYY-MM-DD
function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AddTransactionScreen() {
  // Função para validar limite do cartão antes de cadastrar transação
  const validateCardLimit = (): boolean => {
    if (formData.type === 'expense' && formData.cardId) {
      const selectedOption = availableOptions.find(option => option.id === formData.cardId);
      if (selectedOption && selectedOption.type === 'card' && typeof selectedOption.limit === 'number') {
        if (parseFloat(formData.amount.replace(',', '.')) > selectedOption.limit) {
          Alert.alert('Limite não disponível', 'O valor da despesa excede o limite do cartão.');
          return false;
        }
      }
    }
    return true;
  };
  const { addTransaction, updateTransaction, data } = useData();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Verifica se é modo edição
  const isEditMode = Boolean(params?.editId);
  const editingTransaction = data.transactions.find(t => t.id === params?.editId);

  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    title: '',
    date: getLocalDateString(new Date()),
    categoryId: '',
    paymentMethod: 'cash' as 'cash' | 'pix' | 'card',
    cardId: '',
    installments: '',
    description: '',
    launchType: 'unico' as 'unico' | 'recorrente' | 'parcelado',
    valorComoParcela: false, // novo campo
  });
  const [loading, setLoading] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarTempDate, setCalendarTempDate] = useState(new Date(formData.date));
  const [recorrenteModalVisible, setRecorrenteModalVisible] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('Mensal');
  const [installments, setInstallments] = useState(1);
  const [parceladoModalVisible, setParceladoModalVisible] = useState(false);
  const [parcelas, setParcelas] = useState(1);
  const [valorComoParcela, setValorComoParcela] = useState(false);
  const [parceladoTitle, setParceladoTitle] = useState('');
  const [parceladoDescription, setParceladoDescription] = useState('');
  const typeModalRef = useRef<any>(null);
  const calendarModalRef = useRef<Modalize>(null);
  const recorrenteModalRef = useRef<Modalize>(null);
  const parceladoModalRef = useRef<Modalize>(null);

  const TRANSACTION_TYPES = [
    { value: 'income', label: 'Receita' },
    { value: 'expense', label: 'Despesa' },
  ];
  const selectedType = TRANSACTION_TYPES.find(t => t.value === formData.type);

  const filteredCategories = data.categories.filter(cat => cat.type === formData.type);
  const availableCards = data.cards;
  const availableAccounts = data.accounts || [];
  
  // Combinar cartões e contas em uma única lista para seleção
  const availableOptions = [
    ...availableCards.map(card => ({ ...card, type: 'card' as const, color: theme.colors.secondary })),
    ...availableAccounts.map(account => ({ ...account, type: 'account' as const }))
  ];

  // Logs para verificar as categorias na tela de adicionar transação
  console.log('💰 AddTransaction - Total categorias:', data.categories.length);
  console.log('💰 AddTransaction - Tipo selecionado:', formData.type);
  console.log('💰 AddTransaction - Categorias filtradas:', filteredCategories.length);
  console.log('💰 AddTransaction - Total cartões:', data.cards.length);
  console.log('💰 AddTransaction - Total contas:', data.accounts?.length || 0);
  console.log('💰 AddTransaction - Total opções de pagamento:', availableOptions.length);
  
  if (filteredCategories.length > 0) {
    console.log('💰 AddTransaction - Categorias disponíveis:', filteredCategories.map(c => ({ id: c.id, name: c.name })));
  }
  
  if (data.cards.length > 0) {
    console.log('💰 AddTransaction - Cartões disponíveis:', data.cards.map(c => ({ id: c.id, name: c.name })));
  }
  
  if (data.accounts && data.accounts.length > 0) {
    console.log('💰 AddTransaction - Contas disponíveis:', data.accounts.map(a => ({ id: a.id, name: a.name })));
  }
  
  if (availableOptions.length > 0) {
    console.log('💰 AddTransaction - Opções de pagamento:', availableOptions.map(o => ({ id: o.id, name: o.name, type: o.type })));
  }

  const recurrenceOptions = ['Anual', 'Mensal', 'Semanal',];
  const installmentsOptions = Array.from({ length: 120 }, (_, i) => i + 1);

  useEffect(() => {
    if (params?.type === 'income' || params?.type === 'expense') {
      setFormData(prev => ({ ...prev, type: params.type as 'income' | 'expense', categoryId: '' }));
    }

    // Se é modo edição, preenche o formulário com os dados da transação
    if (isEditMode && editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount.toString().replace('.', ','),
        title: editingTransaction.title || '',
        date: editingTransaction.date,
        categoryId: editingTransaction.categoryId,
        paymentMethod: editingTransaction.paymentMethod,
        cardId: editingTransaction.cardId || '',
        installments: editingTransaction.installments?.toString() || '',
        description: editingTransaction.description,
        launchType: editingTransaction.launchType || 'unico',
        valorComoParcela: editingTransaction.valorComoParcela || false,
      });

      if (editingTransaction.recurrenceType) {
        setRecurrenceType(editingTransaction.recurrenceType);
      }
    }
  }, [params?.type, isEditMode, editingTransaction]);

  const handleSave = async () => {
    if (!formData.amount || formData.amount.trim() === '') {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Por favor, preencha o valor da transação' });
      return;
    }
    
    if (!formData.categoryId) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Por favor, selecione uma categoria' });
      return;
    }
    
    if (!formData.description || formData.description.trim() === '') {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Por favor, preencha a descrição da transação' });
      return;
    }
    
    if (!formData.cardId) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Por favor, selecione um cartão ou conta' });
      return;
    }
    
    const selectedOption = availableOptions.find(option => option.id === formData.cardId);
    if (!selectedOption) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Cartão ou conta selecionada não é válida' });
      return;
    }

    const amount = parseFloat(formData.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Valor deve ser um número válido maior que zero' });
      return;
    }

    // Validação do limite do cartão (apenas para novas transações ou se o valor aumentou)
    if (!isEditMode || (editingTransaction && amount > editingTransaction.amount)) {
      if (!validateCardLimit()) {
        return;
      }
    }

    setLoading(true);
    try {
      // Encontrar se a opção selecionada é cartão ou conta
      const selectedOption = availableOptions.find(option => option.id === formData.cardId);
      
      let accountId: string | undefined = undefined;
      let cardId: string | undefined = undefined;
      if (selectedOption?.type === 'account') {
        accountId = selectedOption.id;
      } else if (selectedOption?.type === 'card') {
        cardId = selectedOption.id;
      }
      const transactionData = {
        type: formData.type,
        amount,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        categoryId: formData.categoryId,
        accountId,
        cardId,
        paymentMethod: formData.paymentMethod,
        launchType: formData.launchType,
        installments: formData.installments ? parseInt(formData.installments) : undefined,
        valorComoParcela: formData.valorComoParcela,
        recurrenceType: formData.launchType === 'recorrente' ? recurrenceType as 'Anual' | 'Mensal' | 'Semanal' : undefined,
      };

      console.log('💰 === DADOS DA TRANSAÇÃO A SER ENVIADA ===');
      console.log('📊 TransactionData:', JSON.stringify(transactionData, null, 2));
      console.log('💰 === FIM DOS DADOS ===');

      if (isEditMode && editingTransaction) {
        // Atualizar transação existente
        await updateTransaction(editingTransaction.id, transactionData);
        Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Transação atualizada com sucesso!' });
      } else {
        // Criar nova transação
        await addTransaction(transactionData);
        Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Transação criada com sucesso!' });
      }
      router.back();
    } catch (error) {
      Toast.show({ 
        type: 'error', 
        text1: 'Erro', 
        text2: isEditMode ? 'Não foi possível atualizar a transação' : 'Não foi possível salvar a transação' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            formData.type === 'income'
              ? theme.colors.income
              : theme.colors.expense,
        },
        { paddingTop: insets.top },
      ]}
    >
      <StatusBar
        backgroundColor={
          formData.type === 'income'
            ? theme.colors.income
            : theme.colors.expense
        }
        barStyle="dark-content"
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarSide}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.topBarButton}
          >
            <ArrowLeft size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.topBarCenter}>
          <TouchableOpacity
            style={styles.typeSelectTop}
            onPress={() => typeModalRef.current?.open()}
          >
            <Text style={styles.typeSelectTopText}>
              {isEditMode ? `Editar ${selectedType?.label}` : selectedType?.label}
            </Text>
            <ChevronDown size={20} color="#fff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
        <View style={styles.topBarSide}>
          <TouchableOpacity style={styles.topBarButton}>
            <Text style={styles.topBarApply}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal customizado para seleção do tipo de transação */}
      <TransactionTypeModal ref={typeModalRef} onClose={() => {}} />

      {/* Large Editable Value Input */}
      <View style={styles.valueSection}>
        <Text style={styles.valueLabel}>Valor</Text>
        <View style={styles.valueRow}>
          <Text style={styles.valueCurrency}>R$</Text>
          <TextInput
            style={styles.valueInput}
            value={formData.amount}
            onChangeText={(text) =>
              setFormData({ ...formData, amount: text.replace(/[^0-9,]/g, '') })
            }
            placeholder="0,00"
            placeholderTextColor="#fff"
            keyboardType="numeric"
            maxLength={12}
            textAlign="left"
            selectionColor="#fff"
          />
        </View>
      </View>

      <ScrollView
        style={[styles.content, { backgroundColor: theme.colors.surface }]}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Título</Text>
          <InputLogin
            value={formData.title || ''}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Ex: Salário, Mercado, etc."
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
        {/* Descrição */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Descrição</Text>
          <InputLogin
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="Adicione uma descrição"
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
        {/* Data */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Data</Text>
          <View style={styles.dateButtonRow}>
            <Button
              title="Hoje"
              onPress={() =>
                setFormData({
                  ...formData,
                  date: getLocalDateString(new Date()),
                })
              }
              variant={
                formData.date === getLocalDateString(new Date())
                  ? 'primary'
                  : 'outline'
              }
              size="small"
              style={{
                ...styles.dateButton,
                flex: 0.7,
                ...(formData.date === getLocalDateString(new Date())
                  ? styles.dateButtonActive
                  : {}),
              }}
            />
            <Button
              title="Ontem"
              onPress={() => {
                const ontem = new Date();
                ontem.setDate(ontem.getDate() - 1);
                setFormData({ ...formData, date: getLocalDateString(ontem) });
              }}
              variant={(() => {
                const ontem = new Date();
                ontem.setDate(ontem.getDate() - 1);
                return formData.date === getLocalDateString(ontem)
                  ? 'primary'
                  : 'outline';
              })()}
              size="small"
              style={{
                ...styles.dateButton,
                flex: 0.7,
                ...(() => {
                  const ontem = new Date();
                  ontem.setDate(ontem.getDate() - 1);
                  return formData.date === getLocalDateString(ontem)
                    ? styles.dateButtonActive
                    : {};
                })(),
              }}
            />
            <Button
              title="Selecionar Data"
              onPress={() => {
                setCalendarTempDate(new Date(formData.date));
                calendarModalRef.current?.open();
              }}
              variant={
                formData.date !== getLocalDateString(new Date()) &&
                formData.date !==
                  (() => {
                    const ontem = new Date();
                    ontem.setDate(ontem.getDate() - 1);
                    return getLocalDateString(ontem);
                  })()
                  ? 'primary'
                  : 'outline'
              }
              size="small"
              style={{
                ...styles.dateButton,
                flex: 1.3,
                ...(formData.date !== getLocalDateString(new Date()) &&
                formData.date !==
                  (() => {
                    const ontem = new Date();
                    ontem.setDate(ontem.getDate() - 1);
                    return getLocalDateString(ontem);
                  })()
                  ? styles.dateButtonActive
                  : {}),
              }}
            />
          </View>
        </View>
        {/* Categoria */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Categoria</Text>
          {/* Troca FlatList por ScrollView horizontal para manter o design e eliminar o erro */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  { backgroundColor: category.color },
                  formData.categoryId === category.id &&
                    styles.categoryOptionSelected,
                ]}
                onPress={() =>
                  setFormData({ ...formData, categoryId: category.id })
                }
              >
                <Text style={styles.categoryOptionText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Conta ou Cartão */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Conta ou Cartão</Text>
          {/* Troca FlatList por ScrollView horizontal para manter o design e eliminar o erro */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {availableOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.cardOption,
                  { backgroundColor: option.color ?? theme.colors.secondary },
                  formData.cardId === option.id && styles.cardOptionSelected,
                ]}
                onPress={() => {
                  console.log('Selecionado:', option);
                  setFormData({ ...formData, cardId: option.id });
                }}
              >
                <Text style={styles.cardOptionText}>
                  {option.name} {option.type === 'account' ? '(Conta)' : '(Cartão)'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Lançamento */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Lançamento</Text>
          <View style={styles.dateButtonRow}>
            <Button
              title="Único"
              onPress={() => setFormData({ ...formData, launchType: 'unico' })}
              variant={formData.launchType === 'unico' ? 'primary' : 'outline'}
              size="small"
              style={{
                ...styles.dateButton,
                flex: 0.9,
                ...(formData.launchType === 'unico'
                  ? styles.dateButtonActive
                  : {}),
              }}
            />
            <Button
              title="Recorrente"
              onPress={() => {
                setFormData({ ...formData, launchType: 'recorrente' });
                recorrenteModalRef.current?.open();
              }}
              variant={
                formData.launchType === 'recorrente' ? 'primary' : 'outline'
              }
              size="small"
              style={{
                ...styles.dateButton,
                flex: 1.1,
                ...(formData.launchType === 'recorrente'
                  ? styles.dateButtonActive
                  : {}),
              }}
            />
            <Button
              title="Parcelado"
              onPress={() => {
                setFormData({ ...formData, launchType: 'parcelado' });
                parceladoModalRef.current?.open();
              }}
              variant={
                formData.launchType === 'parcelado' ? 'primary' : 'outline'
              }
              size="small"
              style={{
                ...styles.dateButton,
                flex: 1.1,
                ...(formData.launchType === 'parcelado'
                  ? styles.dateButtonActive
                  : {}),
              }}
            />
          </View>
        </View>
        {/* Botões de ação */}
        <View style={styles.buttonRow}>
          <Button
            title={loading 
              ? (isEditMode ? 'Atualizando...' : 'Adicionando...') 
              : (isEditMode ? 'Atualizar' : 'Adicionar')
            }
            onPress={handleSave}
            disabled={loading}
            style={{ width: '100%' }}
          />
        </View>
      </ScrollView>
      {/* Modal de Calendário */}
      <Modalize
        ref={calendarModalRef}
        adjustToContentHeight
        handleStyle={{ backgroundColor: theme.colors.border }}
        modalStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
        }}
        onClose={() => setCalendarVisible(false)}
      >
        <Text style={styles.calendarModalTitle}>Selecione a data</Text>
        <Calendar
          current={getLocalDateString(calendarTempDate)}
          onDayPress={(day) => {
            setCalendarTempDate(new Date(day.dateString));
          }}
          markedDates={{
            [getLocalDateString(calendarTempDate)]: {
              selected: true,
              selectedColor: theme.colors.primary,
            },
          }}
          theme={{
            backgroundColor: theme.colors.surface,
            calendarBackground: theme.colors.surface,
            textSectionTitleColor: theme.colors.textSecondary,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: theme.colors.surface,
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.text,
            textDisabledColor: theme.colors.border,
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.title,
            indicatorColor: theme.colors.primary,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />
        {/* Linha separadora */}
        <View
          style={{
            height: 1,
            backgroundColor: theme.colors.border,
            marginVertical: 16,
          }}
        />
        {/* Botões Hoje/Ontem */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Button
            title="Hoje"
            onPress={() => setCalendarTempDate(new Date())}
            variant={(() => {
              const hoje = getLocalDateString(new Date());
              return getLocalDateString(calendarTempDate) === hoje
                ? 'primary'
                : 'outline';
            })()}
            size="small"
            style={{ flex: 1 }}
          />
          <Button
            title="Ontem"
            onPress={() => {
              const ontem = new Date();
              ontem.setDate(ontem.getDate() - 1);
              setCalendarTempDate(ontem);
            }}
            variant={(() => {
              const ontem = new Date();
              ontem.setDate(ontem.getDate() - 1);
              return getLocalDateString(calendarTempDate) ===
                getLocalDateString(ontem)
                ? 'primary'
                : 'outline';
            })()}
            size="small"
            style={{ flex: 1 }}
          />
        </View>
        {/* Botão Salvar */}
        <View style={{ alignItems: 'center' }}>
          <Button
            title="Salvar"
            onPress={() => {
              const selectedDate = getLocalDateString(calendarTempDate);
              setFormData({ ...formData, date: selectedDate });
              calendarModalRef.current?.close();
            }}
            style={{ minWidth: 140 }}
          />
        </View>
      </Modalize>
      <Modalize
        ref={recorrenteModalRef}
        modalHeight={400}
        handleStyle={{ backgroundColor: theme.colors.border }}
        modalStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
        }}
        onClose={() => {}}
      >
        {/* Container principal ocupa toda a altura do modal */}
        <View style={{ flex: 1, height: '100%' }}>
          {/* Título fixo no topo */}
          <View>
            <Text
              style={{
                fontSize: 22,
                color: theme.colors.text,
                textAlign: 'center',
                fontWeight: '400',
              }}
            >
              Receita <Text style={{ fontWeight: 'bold' }}>recorrente</Text>
            </Text>
          </View>

          {/* Conteúdo centralizado */}
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 30,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                gap: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* Coluna Recorrência */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: theme.colors.textSecondary,
                    marginBottom: 8,
                    fontWeight: 'bold',
                  }}
                >
                  Recorrência
                </Text>
                <ScrollView
                  style={{ maxHeight: 150 }}
                  contentContainerStyle={{ alignItems: 'center' }}
                  showsVerticalScrollIndicator={false}
                >
                  {recurrenceOptions.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setRecurrenceType(item)}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: recurrenceType === item ? 'bold' : '400',
                          color:
                            recurrenceType === item
                              ? theme.colors.primary
                              : theme.colors.text,
                          marginVertical: 10,
                          textAlign: 'center',
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Coluna Parcelas */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: theme.colors.textSecondary,
                    marginBottom: 8,
                    fontWeight: 'bold',
                  }}
                >
                  Parcelas
                </Text>
                <ScrollView
                  style={{ maxHeight: 150 }}
                  contentContainerStyle={{ alignItems: 'center' }}
                  showsVerticalScrollIndicator={false}
                >
                  {installmentsOptions.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setInstallments(item)}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: installments === item ? 'bold' : '400',
                          color:
                            installments === item
                              ? theme.colors.primary
                              : theme.colors.text,
                          marginVertical: 10,
                          textAlign: 'center',
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Botão sempre no rodapé */}
          <View>
            <Button
              title="Salvar"
              onPress={() => {
                setFormData({
                  ...formData,
                  launchType: 'recorrente',
                  installments: installments.toString(),
                });
                recorrenteModalRef.current?.close();
              }}
              style={{
                minWidth: 180,
                borderRadius: 24,
                alignSelf: 'center',
                marginTop: 8,
                height: 51,
                justifyContent: 'center',
              }}
              textStyle={{ fontSize: 18, fontWeight: 'bold' }}
            />
          </View>
        </View>
      </Modalize>

      {/* Modal de Parcelado */}
      <Modalize
        ref={parceladoModalRef}
        modalHeight={500}
        handleStyle={{ backgroundColor: theme.colors.border }}
        modalStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
        }}
        onClose={() => {}}
      >
        {/* Título estilizado */}
        <Text
          style={{
            fontSize: 22,
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: 24,
            fontWeight: '400',
          }}
        >
          Receita <Text style={{ fontWeight: 'bold' }}>Parcelada</Text>
        </Text>
        {/* Lista vertical rolável de parcelas, começando do 1 */}
        <View
          style={{
            alignItems: 'center',
            marginBottom: 32,
            height: 200,
            justifyContent: 'center',
          }}
        >
          <ScrollView
            style={{ maxHeight: 200, minWidth: 100 }}
            contentContainerStyle={{
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingVertical: 0,
            }}
            showsVerticalScrollIndicator={false}
          >
            {Array.from({ length: 360 }, (_, i) => i + 1).map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setParcelas(item)}
                style={{
                  marginVertical: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 100,
                }}
              >
                <Text
                  style={{
                    fontSize: item === parcelas ? 38 : 24,
                    color:
                      item === parcelas
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                    fontWeight: item === parcelas ? 'bold' : 'normal',
                    opacity: item === parcelas ? 1 : 0.5,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Caixa com borda, checkbox, label e descrição */}
        <View
          style={{
            borderWidth: 1.5,
            borderColor: theme.colors.border,
            borderRadius: 16,
            padding: 16,
            marginBottom: 32,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            alignItems: 'flex-start',
          }}
        >
          <TouchableOpacity
            style={{ marginRight: 12, marginTop: 2 }}
            onPress={() => setValorComoParcela((v) => !v)}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: valorComoParcela
                  ? theme.colors.primary
                  : 'transparent',
              }}
            >
              {valorComoParcela && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    backgroundColor: theme.colors.surface,
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 2,
              }}
            >
              Valor da parcela
            </Text>
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: 13,
                opacity: 0.7,
              }}
            >
              Marcar essa opção significa usar valor da parcela ao invés do
              total
            </Text>
          </View>
        </View>
        {/* Botão Aplicar */}
        <Button
          title="Aplicar"
          onPress={() => {
            setFormData({
              ...formData,
              launchType: 'parcelado',
              installments: parcelas.toString(),
              valorComoParcela,
            });
            parceladoModalRef.current?.close();
          }}
          style={{
            minWidth: 180,
            borderRadius: 24,
            alignSelf: 'center',
            marginTop: 8,
            height: 48,
            justifyContent: 'center',
          }}
          textStyle={{ fontSize: 18, fontWeight: 'bold' }}
        />
      </Modalize>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8, 
    paddingVertical: 12,
  },
  topBarSide: {
    minWidth: 70, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarButton: {
    minWidth: 60,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  typeSelectTop: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  typeSelectTopText: {
    color: theme.colors.title,
    fontSize: 18,
    fontWeight: 'bold',
  },
  topBarApply: {
    color: theme.colors.title,
    fontSize: 16,
    fontWeight: '500',
  },
  valueSection: {
    alignItems: 'flex-start',
    marginBottom: 24,
    width: '100%',
    paddingHorizontal: 16,
  },
  valueLabel: {
    color: theme.colors.title,
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'left',
    width: '100%',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  valueCurrency: {
    color: theme.colors.title,
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 4,
  },
  valueInput: {
    color: theme.colors.title,
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 2,
    minWidth: 120,
    paddingVertical: 0,
    paddingHorizontal: 4,
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 24,
  },
  categoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryOptionSelected: {
    borderColor: theme.colors.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  paymentButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  paymentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  paymentButtonTextActive: {
    color: theme.colors.surface,
  },
  cardOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardOptionSelected: {
    borderColor: theme.colors.primary,
  },
  cardOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
    color: theme.colors.surface,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonOutlineText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  typeModalSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    alignItems: 'center',
  },
  typeModalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  typeModalRoot: {
    zIndex: 9999,
    elevation: 9999,
  },
  typeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  typeModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeModalOptionSelected: {
    backgroundColor: theme.colors.primarySoft,
  },
  typeModalOptionText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  calendarModalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    alignItems: 'center',
  },
  calendarModalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  calendarModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  dateButtonRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  dateButton: {
    flex: 0.4,
    borderRadius: 18,
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,

  },
  dateButtonActive: {
    borderColor: theme.colors.primary,
  },
});
