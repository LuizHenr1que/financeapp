import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { theme } from '@/theme';

export type AccountIconSelectorModalRef = {
  open: () => void;
  close: () => void;
};

export type AccountIconOption = {
  key: string;
  label: string;
  image?: any; // para imagens locais futuramente
  emoji?: string;
};

export const ICONS: AccountIconOption[] = [
  { key: 'wallet', label: 'Carteira', emoji: '👛' },
  { key: 'mastercard', label: 'Mastercard', emoji: '💳' },
  { key: 'visa', label: 'Visa', emoji: '💳' },
  { key: 'hipercard', label: 'Hipercard', emoji: '💳' },
  { key: 'elo', label: 'Elo', emoji: '💳' },
  { key: 'amex', label: 'Amex', emoji: '💳' },
  { key: 'bb', label: 'Banco do Brasil', emoji: '🏦' },
  { key: 'itau', label: 'Itaú', emoji: '🏦' },
  { key: 'bradesco', label: 'Bradesco', emoji: '🏦' },
  { key: 'bradescard', label: 'Bradescard', emoji: '🏦' },
  { key: 'santander', label: 'Santander', emoji: '🏦' },
  { key: 'caixa', label: 'Caixa', emoji: '🏦' },
];

interface Props {
  onSelect: (icon: AccountIconOption) => void;
}

export const AccountIconSelectorModal = forwardRef<AccountIconSelectorModalRef, Props>(({ onSelect }, ref) => {
  const modalRef = useRef<Modalize>(null);

  useImperativeHandle(ref, () => ({
    open: () => modalRef.current?.open(),
    close: () => modalRef.current?.close(),
  }));

  return (
    <Modalize
      ref={modalRef}
      modalHeight={500}
      handleStyle={{ backgroundColor: theme.colors.border }}
      modalStyle={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}
      flatListProps={{
        data: ICONS,
        numColumns: 3,
        keyExtractor: item => item.key,
        renderItem: ({ item }) => (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              onSelect(item);
              modalRef.current?.close();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
            </View>
            <Text style={styles.iconLabel}>{item.label}</Text>
          </TouchableOpacity>
        ),
        contentContainerStyle: { gap: 16, paddingTop: 16 },
        columnWrapperStyle: { justifyContent: 'space-between', marginBottom: 24 },
        ListHeaderComponent: () => (
          <Text style={styles.title}>Selecionar banco</Text>
        ),
      }}
    />
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
  iconButton: {
    alignItems: 'center',
    width: '30%',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconLabel: {
    color: theme.colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
});
