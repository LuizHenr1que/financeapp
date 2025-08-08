import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Image } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { theme } from '@/theme';
import CachedImage from './CachedImage';
import ImageCacheService from '../services/ImageCacheService';

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

// Função para obter a URL base das imagens
const getImageBaseUrl = () => {
  if (__DEV__) {
    // Durante desenvolvimento
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000'; // Android Emulator
    } else {
      return 'http://localhost:3000'; 
    }
  } else {
    // Em produção
    return 'https://financeapp-as0q.onrender.com';
  }
};

const IMAGE_BASE_URL = getImageBaseUrl();

export const ICONS: AccountIconOption[] = [
  { key: 'wallet', label: 'Carteira', emoji: '👛' },
  { key: 'Cartao', label: 'Visa', emoji: '💳' },
  { key: 'c6', label: 'C6 Bank', image: { uri: `${IMAGE_BASE_URL}/public/imagens/logo-c6.png` } },
  { key: 'bb', label: 'Banco do Brasil',  image: { uri: `${IMAGE_BASE_URL}/public/imagens/logo-bb.png` } },
  { key: 'itau', label: 'Itaú',  image: { uri: `${IMAGE_BASE_URL}/public/imagens/logo-itau.png` } },
  { key: 'mercadopago', label: 'Mercado Pago',  image: { uri: `${IMAGE_BASE_URL}/public/imagens/logo-mp.png` } },
  { key: 'santander', label: 'Santander',  image: { uri: `${IMAGE_BASE_URL}/public/imagens/logo-santander.png` } },
  { key: 'caixa', label: 'Caixa',  image: { uri: `${IMAGE_BASE_URL}/public/imagens/logo-caixa.png` } },
];

interface Props {
  onSelect: (icon: AccountIconOption) => void;
  title?: string;
}

// Cache global de imagens para acesso rápido
export const globalImageCache: Record<string, string> = {};

// Função para pré-carregar todas as imagens dos bancos
export const preloadAccountIcons = async () => {
  console.log('🔄 Pré-carregando ícones de bancos...');
  
  const imagesToCache = ICONS
    .filter(icon => icon.image?.uri)
    .map(icon => ({
      key: icon.key,
      url: icon.image!.uri,
    }));

  // Carrega as imagens e popula o cache global
  const cachePromises = imagesToCache.map(async ({ key, url }) => {
    try {
      // Verifica se já está em cache primeiro
      const existingPath = await ImageCacheService.getCachedImagePath(key);
      if (existingPath) {
        globalImageCache[key] = existingPath;
        console.log(`✅ Imagem já em cache: ${key}`);
        return;
      }

      // Se não estiver, baixa e armazena
      const cachedPath = await ImageCacheService.cacheImage(key, url);
      if (cachedPath) {
        globalImageCache[key] = cachedPath;
        console.log(`✅ Imagem baixada e armazenada: ${key}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao carregar imagem ${key}:`, error);
    }
  });

  await Promise.all(cachePromises);
  console.log('✅ Ícones de bancos pré-carregados');
  console.log('📋 Cache global atual:', Object.keys(globalImageCache));
};

const AccountIconSelectorModalInner = (
  { onSelect, title = 'Selecionar banco' }: Props,
  ref: React.Ref<AccountIconSelectorModalRef>
) => {
  const modalRef = useRef<Modalize>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Pré-carrega imagens ao montar o componente
  useEffect(() => {
    const loadImages = async () => {
      setImagesLoaded(false);
      setLoadingProgress(0);
      
      const imagesToLoad = ICONS.filter(icon => icon.image?.uri);
      let loadedCount = 0;
      
      for (const icon of imagesToLoad) {
        // Verifica se já está no cache global
        if (!globalImageCache[icon.key]) {
          try {
            const cachedPath = await ImageCacheService.getCachedImagePath(icon.key);
            if (cachedPath) {
              globalImageCache[icon.key] = cachedPath;
            }
          } catch (error) {
            console.error(`❌ Erro ao verificar cache de ${icon.key}:`, error);
          }
        }
        
        loadedCount++;
        setLoadingProgress((loadedCount / imagesToLoad.length) * 100);
      }
      
      setImagesLoaded(true);
      console.log('✅ Modal: Todas as imagens verificadas/carregadas');
    };
    
    loadImages();
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
                // Usar diretamente o cache global se disponível, senão fallback para emoji
                globalImageCache[item.key] ? (
                  <Image
                    source={{ uri: globalImageCache[item.key] }}
                    style={{ width: 32, height: 32 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={{ fontSize: 32 }}>{item.emoji || '🏦'}</Text>
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
          <View>
            <Text style={styles.title}>{title}</Text>
            {!imagesLoaded && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  Carregando ícones... {Math.round(loadingProgress)}%
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${loadingProgress}%` }]} 
                  />
                </View>
              </View>
            )}
          </View>
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
  loadingContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
});

export const AccountIconSelectorModal = forwardRef(AccountIconSelectorModalInner);
