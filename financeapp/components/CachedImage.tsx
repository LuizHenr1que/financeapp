import React, { useState, useEffect } from 'react';
import { Image, ImageProps, ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import ImageCacheService from '../services/ImageCacheService';
import { theme } from '@/theme';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  cacheKey: string;
  sourceUrl?: string;
  fallbackEmoji?: string;
  showLoader?: boolean;
  loaderSize?: 'small' | 'large';
  loaderColor?: string;
}

export default function CachedImage({
  cacheKey,
  sourceUrl,
  fallbackEmoji,
  showLoader = true,
  loaderSize = 'small',
  loaderColor = theme.colors.text,
  style,
  ...imageProps
}: CachedImageProps) {
  const [localImagePath, setLocalImagePath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadImage();
  }, [cacheKey, sourceUrl]);

  const loadImage = async () => {
    if (!sourceUrl) {
      setHasError(true);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);

      // Primeiro verifica se já está em cache
      let cachedPath = await ImageCacheService.getCachedImagePath(cacheKey);
      
      if (cachedPath) {
        setLocalImagePath(cachedPath);
      } else if (sourceUrl) {
        // Se não está em cache, baixa e armazena
        cachedPath = await ImageCacheService.cacheImage(cacheKey, sourceUrl);
        if (cachedPath) {
          setLocalImagePath(cachedPath);
        } else {
          setHasError(true);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar imagem:', cacheKey, error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const renderContent = () => {
    // Se tem erro e tem emoji fallback, mostra o emoji
    if (hasError && fallbackEmoji) {
      return (
        <View style={[styles.fallbackContainer, style]}>
          <Text style={styles.fallbackEmoji}>{fallbackEmoji}</Text>
        </View>
      );
    }

    // Se está carregando, mostra loader
    if (isLoading && showLoader) {
      return (
        <View style={[styles.loaderContainer, style]}>
          <ActivityIndicator size={loaderSize} color={loaderColor} />
        </View>
      );
    }

    // Se tem caminho local, mostra a imagem
    if (localImagePath && !hasError) {
      return (
        <Image
          {...imageProps}
          source={{ uri: localImagePath }}
          style={style}
          onError={handleImageError}
        />
      );
    }

    // Fallback: mostra emoji se disponível, senão loader
    if (fallbackEmoji) {
      return (
        <View style={[styles.fallbackContainer, style]}>
          <Text style={styles.fallbackEmoji}>{fallbackEmoji}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.loaderContainer, style]}>
        <ActivityIndicator size={loaderSize} color={loaderColor} />
      </View>
    );
  };

  return renderContent();
}

const styles = StyleSheet.create({
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  fallbackEmoji: {
    fontSize: 32,
  },
});
