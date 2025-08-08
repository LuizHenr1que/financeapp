import { useState, useEffect } from 'react';
import ImageCacheService from '../services/ImageCacheService';

interface UseImageCacheReturn {
  localPath: string | null;
  isLoading: boolean;
  error: boolean;
  reload: () => void;
}

export function useImageCache(key: string, url?: string): UseImageCacheReturn {
  const [localPath, setLocalPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadImage = async () => {
    if (!url) {
      setError(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(false);

      // Verifica se já está em cache
      let cachedPath = await ImageCacheService.getCachedImagePath(key);
      
      if (cachedPath) {
        setLocalPath(cachedPath);
      } else {
        // Se não está em cache, baixa e armazena
        cachedPath = await ImageCacheService.cacheImage(key, url);
        if (cachedPath) {
          setLocalPath(cachedPath);
        } else {
          setError(true);
        }
      }
    } catch (err) {
      console.error('❌ Erro ao carregar imagem no hook:', key, err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImage();
  }, [key, url]);

  const reload = () => {
    setLocalPath(null);
    setError(false);
    loadImage();
  };

  return {
    localPath,
    isLoading,
    error,
    reload,
  };
}

// Hook para pré-carregar múltiplas imagens
export function usePreloadImages(images: { key: string; url: string }[]) {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadComplete, setPreloadComplete] = useState(false);

  const preloadImages = async () => {
    if (images.length === 0) return;

    try {
      setIsPreloading(true);
      await ImageCacheService.preloadImages(images);
      setPreloadComplete(true);
    } catch (error) {
      console.error('❌ Erro ao pré-carregar imagens:', error);
    } finally {
      setIsPreloading(false);
    }
  };

  useEffect(() => {
    preloadImages();
  }, [images]);

  return {
    isPreloading,
    preloadComplete,
    preloadImages,
  };
}

// Hook para gerenciar cache
export function useImageCacheManager() {
  const [cacheInfo, setCacheInfo] = useState({
    totalFiles: 0,
    totalSize: 0,
    oldestFile: 0,
    newestFile: 0,
  });

  const refreshCacheInfo = async () => {
    const info = await ImageCacheService.getCacheInfo();
    setCacheInfo(info);
  };

  const clearCache = async () => {
    await ImageCacheService.clearAllCache();
    await refreshCacheInfo();
  };

  const cleanupCache = async () => {
    await ImageCacheService.cleanupCache();
    await refreshCacheInfo();
  };

  useEffect(() => {
    refreshCacheInfo();
  }, []);

  return {
    cacheInfo,
    refreshCacheInfo,
    clearCache,
    cleanupCache,
  };
}
