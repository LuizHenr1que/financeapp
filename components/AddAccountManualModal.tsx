import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { theme } from '@/theme';
import { ChevronRight } from 'lucide-react-native';
import { AccountIconSelectorModal, AccountIconSelectorModalRef, AccountIconOption } from './AccountIconSelectorModal';
import { ICONS } from './AccountIconSelectorModal';

export type AddAccountManualModalRef = {
  open: () => void;
  close: () => void;
};

export const AddAccountManualModal = forwardRef<AddAccountManualModalRef>((props, ref) => {
  const modalRef = React.useRef<Modalize>(null);
  const iconSelectorRef = useRef<AccountIconSelectorModalRef>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [icon, setIcon] = useState<AccountIconOption['key']>('wallet');

  useImperativeHandle(ref, () => ({
    open: () => modalRef.current?.open(),
    close: () => modalRef.current?.close(),
  }));

  const handleSave = () => {
    // Aqui você pode adicionar lógica para salvar a conta
    console.log('Conta criada:', { name, balance, icon });
    modalRef.current?.close();
    setName('');
    setBalance('');
    setIcon('wallet');
  };

  return (
    <>
      <Modalize
        ref={modalRef}
        modalHeight={340}
        handleStyle={{ backgroundColor: theme.colors.border }}
        modalStyle={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}
      >
        <Text style={styles.title}>Criar nova conta</Text>
         {/* Input select de ícone da conta */}
        <Text style={styles.label}>Ícone da conta</Text>
        <TouchableOpacity
          style={[styles.selectInput, { marginBottom: 16 }]}
          onPress={() => iconSelectorRef.current?.open()}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {icon ? (
              <Text style={{ fontSize: 22, marginRight: 8 }}>{ICONS.find((i: AccountIconOption) => i.key === icon)?.emoji}</Text>
            ) : null}
            <Text style={{ color: icon ? theme.colors.text : theme.colors.textSecondary, fontSize: 16 }}>
              {icon ? ICONS.find((i: AccountIconOption) => i.key === icon)?.label : 'Selecione o ícone da conta'}
            </Text>
          </View>
          <ChevronRight size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.label}>Título da conta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Carteira, Banco, etc."
          value={name}
          onChangeText={setName}
          placeholderTextColor={theme.colors.textSecondary}
        />
        <Text style={styles.label}>Saldo inicial</Text>
        <TextInput
          style={styles.input}
          placeholder="R$ 0,00"
          value={balance}
          onChangeText={setBalance}
          keyboardType="numeric"
          placeholderTextColor={theme.colors.textSecondary}
        />
       
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.border, flex: 1 }]} onPress={() => modalRef.current?.close()}>
            <Text style={[styles.saveButtonText, { color: theme.colors.text }]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveButton, { flex: 1 }]} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </Modalize>
      <AccountIconSelectorModal
        ref={iconSelectorRef}
        onSelect={iconOption => setIcon(iconOption.key)}
      />
    </>
  );
});

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'left',
  },
  label: {
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 6,
    fontWeight: '500',
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    padding: 14,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    marginBottom: 16,
    fontSize: 16,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    padding: 14,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    marginBottom: 16,
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
