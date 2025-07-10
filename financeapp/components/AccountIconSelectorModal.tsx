import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
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
  { key: 'Cartao', label: 'Visa', emoji: '💳' },
{ key: 'c6', label: 'C6 Bank', image: { uri: 'http://10.0.2.2:3000/public/imagens/logo-c6.png' } },
  { key: 'bb', label: 'Banco do Brasil',  image: { uri: 'http://10.0.2.2:3000/public/imagens/logo-bb.png' } },
  { key: 'itau', label: 'Itaú',  image: { uri: 'http://10.0.2.2:3000/public/imagens/logo-itau.png' } },
  { key: 'mercadopago', label: 'Mercado Pago',  image: { uri: 'http://10.0.2.2:3000/public/imagens/logo-mp.png' } },
  { key: 'santander', label: 'Santander',  image: { uri: 'http://10.0.2.2:3000/public/imagens/logo-santander.png' } },
  { key: 'caixa', label: 'Caixa',  image: { uri: 'http://10.0.2.2:3000/public/imagens/logo-caixa.png' } },
  { key: 'c6', label: 'C6 Bank', image: { uri: 'http://10.0.2.2:3000/public/imagens/logo-c6.png' } },
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
              {item.image ? (
                <Image
                  source={item.image}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
              )}
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
