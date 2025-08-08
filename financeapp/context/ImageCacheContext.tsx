import React, { createContext, useContext, useEffect, useState } from 'react';
import ImageCacheService from '../services/ImageCacheService';
import { preloadAccountIcons } from '../components/AccountIconSelectorModal';

interface ImageCacheContextType {
  isInitialized: boolean;
  isPreloading: boolean;
  cacheInfo: {
    totalFiles: number;
    totalSize: number;
    oldestFile: number;
    newestFile: number;
  };
  preloadBankIcons: () => Promise<void>;
  clearCache: () => Promise<void>;
  cleanupCache: () => Promise<void>;
  refreshCacheInfo: () => Promise<void>;
}

const ImageCacheContext = createContext<ImageCacheContextType | undefined>(undefined);

export function ImageCacheProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({
    totalFiles: 0,
    totalSize: 0,
    oldestFile: 0,
    newestFile: 0,
  });

  const refreshCacheInfo = async () => {
    try {
      const info = await ImageCacheService.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('❌ Erro ao obter informações do cache:', error);
    }
  };

  const preloadBankIcons = async () => {
    try {
      setIsPreloading(true);
      await preloadAccountIcons();
      await refreshCacheInfo();
    } catch (error) {
      console.error('❌ Erro ao pré-carregar ícones:', error);
    } finally {
      setIsPreloading(false);
    }
  };

  const clearCache = async () => {
    try {
      await ImageCacheService.clearAllCache();
      await refreshCacheInfo();
      console.log('🧹 Cache limpo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  };

  const cleanupCache = async () => {
    try {
      await ImageCacheService.cleanupCache();
      await refreshCacheInfo();
      console.log('🧹 Cache otimizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao otimizar cache:', error);
    }
  };

  // Inicialização e pré-carregamento automático
  useEffect(() => {
    const initialize = async () => {
      try {
        await refreshCacheInfo();
        setIsInitialized(true);
        
        // Pré-carrega ícones de bancos automaticamente
        await preloadBankIcons();
        
        console.log('✅ Cache de imagens inicializado');
      } catch (error) {
        console.error('❌ Erro ao inicializar cache:', error);
        setIsInitialized(true); // Marca como inicializado mesmo com erro
      }
    };

    initialize();
  }, []);

  return (
    <ImageCacheContext.Provider
      value={{
        isInitialized,
        isPreloading,
        cacheInfo,
        preloadBankIcons,
        clearCache,
        cleanupCache,
        refreshCacheInfo,
      }}
    >
      {children}
    </ImageCacheContext.Provider>
  );
}

export function useImageCacheContext() {
  const context = useContext(ImageCacheContext);
  if (context === undefined) {
    throw new Error('useImageCacheContext deve ser usado dentro de um ImageCacheProvider');
  }
  return context;
}
