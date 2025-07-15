import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
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
  { key: 'c6', label: 'C6 Bank', image: { uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api','')}/public/imagens/logo-c6.png` } },
  { key: 'bb', label: 'Banco do Brasil',  image: { uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api','')}/public/imagens/logo-bb.png` } },
  { key: 'itau', label: 'Itaú',  image: { uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api','')}/public/imagens/logo-itau.png` } },
  { key: 'mercadopago', label: 'Mercado Pago',  image: { uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api','')}/public/imagens/logo-mp.png` } },
  { key: 'santander', label: 'Santander',  image: { uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api','')}/public/imagens/logo-santander.png` } },
  { key: 'caixa', label: 'Caixa',  image: { uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api','')}/public/imagens/logo-caixa.png` } },
];

interface Props {
  onSelect: (icon: AccountIconOption) => void;
  title?: string;
}

// Cache global de imagens para uso em outros componentes
export const globalImageCache: { [key: string]: string | undefined } = {};

// Função para pré-carregar imagens e popular o cache global
export const preloadAccountIcons = async () => {
  for (const icon of ICONS) {
    if (icon.image && icon.image.uri && !globalImageCache[icon.key]) {
      try {
        const response = await fetch(icon.image.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onloadend = () => {
            globalImageCache[icon.key] = reader.result as string;
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        globalImageCache[icon.key] = undefined;
      }
    }
  }
};

const AccountIconSelectorModalInner = (
  { onSelect, title = 'Selecionar banco' }: Props,
  ref: React.Ref<AccountIconSelectorModalRef>
) => {
  const modalRef = useRef<Modalize>(null);
  const [imageCache, setImageCache] = useState<{ [key: string]: string | undefined }>({});

  // Função para baixar e salvar imagem no cache local e global
  const fetchImage = async (uri: string, key: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageCache(prev => ({ ...prev, [key]: reader.result as string }));
        globalImageCache[key] = reader.result as string;
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      setImageCache(prev => ({ ...prev, [key]: undefined }));
      globalImageCache[key] = undefined;
    }
  };

  // Pré-carrega imagens ao montar o componente (e salva no cache global)
  useEffect(() => {
    ICONS.forEach(icon => {
      if (icon.image && icon.image.uri && !imageCache[icon.key]) {
        fetchImage(icon.image.uri, icon.key);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    open: () => {
      modalRef.current?.open();
    },
    close: () => modalRef.current?.close(),
  }), []);

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
              {item.image && item.image.uri ? (
                imageCache[item.key] ? (
                  <Image
                    source={{ uri: imageCache[item.key] }}
                    style={{ width: 32, height: 32 }}
                    resizeMode="contain"
                  />
                ) : (
                  <ActivityIndicator size="small" color={theme.colors.text} />
                )
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
          <Text style={styles.title}>{title}</Text>
        ),
      }}
    />
  );
};

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

export const AccountIconSelectorModal = forwardRef(AccountIconSelectorModalInner);
