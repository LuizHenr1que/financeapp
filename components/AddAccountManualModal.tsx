import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { theme } from '@/theme';

export type AddAccountManualModalRef = {
  open: () => void;
  close: () => void;
};

export const AddAccountManualModal = forwardRef<AddAccountManualModalRef>((props, ref) => {
  const modalRef = React.useRef<Modalize>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  useImperativeHandle(ref, () => ({
    open: () => modalRef.current?.open(),
    close: () => modalRef.current?.close(),
  }));

  const handleSave = () => {
    // Aqui você pode adicionar lógica para salvar a conta
    console.log('Conta criada:', { name, balance });
    modalRef.current?.close();
    setName('');
    setBalance('');
  };

  return (
    <Modalize
      ref={modalRef}
      modalHeight={340}
      handleStyle={{ backgroundColor: theme.colors.border }}
      modalStyle={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}
    >
      <Text style={styles.title}>Criar nova conta</Text>
      <Text style={styles.label}>Nome da conta</Text>
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
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>
    </Modalize>
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
