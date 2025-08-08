import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedImage {
  key: string;
  localPath: string;
  originalUrl: string;
  downloadedAt: number;
  size: number;
}

class ImageCacheService {
  private cacheDir: string;
  private cacheMetadataKey = '@image_cache_metadata';
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 dias

  constructor() {
    this.cacheDir = FileSystem.documentDirectory + 'image_cache/';
    this.initializeCache();
  }

  private async initializeCache() {
    try {
      // Cria o diretório de cache se não existir
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
        console.log('📁 Diretório de cache criado:', this.cacheDir);
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar cache:', error);
    }
  }

  private async getCacheMetadata(): Promise<CachedImage[]> {
    try {
      const metadata = await AsyncStorage.getItem(this.cacheMetadataKey);
      return metadata ? JSON.parse(metadata) : [];
    } catch (error) {
      console.error('❌ Erro ao obter metadata do cache:', error);
      return [];
    }
  }

  private async saveCacheMetadata(metadata: CachedImage[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.cacheMetadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('❌ Erro ao salvar metadata do cache:', error);
    }
  }

  private generateFileName(url: string): string {
    // Gera um nome de arquivo baseado na URL
    const urlHash = url.replace(/[^a-zA-Z0-9]/g, '_');
    const extension = url.split('.').pop()?.toLowerCase() || 'png';
    return `${urlHash}.${extension}`;
  }

  /**
   * Baixa e armazena uma imagem no cache local
   */
  async cacheImage(key: string, url: string): Promise<string | null> {
    try {
      // Verifica se já está em cache
      const cachedPath = await this.getCachedImagePath(key);
      if (cachedPath) {
        console.log('✅ Imagem já em cache:', key);
        return cachedPath;
      }

      console.log('⬇️ Baixando imagem:', key, url);

      // Validação da URL
      if (!url || url.includes('undefined') || !url.startsWith('http')) {
        console.error('❌ URL inválida para imagem:', key, url);
        return null;
      }

      const fileName = this.generateFileName(url);
      const localPath = this.cacheDir + fileName;

      // Download da imagem
      const downloadResult = await FileSystem.downloadAsync(url, localPath);

      if (downloadResult.status === 200) {
        // Obtém informações do arquivo
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        
        if (fileInfo.exists) {
          // Atualiza metadata do cache
          const metadata = await this.getCacheMetadata();
          const newCachedImage: CachedImage = {
            key,
            localPath,
            originalUrl: url,
            downloadedAt: Date.now(),
            size: fileInfo.size || 0,
          };

          // Remove entrada antiga se existir
          const filteredMetadata = metadata.filter(item => item.key !== key);
          filteredMetadata.push(newCachedImage);

          await this.saveCacheMetadata(filteredMetadata);

          console.log('✅ Imagem baixada e armazenada:', key, localPath);
          return localPath;
        }
      }

      console.error('❌ Falha no download da imagem:', key, downloadResult.status);
      return null;
    } catch (error) {
      console.error('❌ Erro ao fazer cache da imagem:', key, error);
      return null;
    }
  }

  /**
   * Obtém o caminho local de uma imagem em cache
   */
  async getCachedImagePath(key: string): Promise<string | null> {
    try {
      const metadata = await this.getCacheMetadata();
      const cachedImage = metadata.find(item => item.key === key);

      if (cachedImage) {
        // Verifica se o arquivo ainda existe
        const fileInfo = await FileSystem.getInfoAsync(cachedImage.localPath);
        if (fileInfo.exists) {
          // Verifica se não expirou
          const age = Date.now() - cachedImage.downloadedAt;
          if (age < this.maxCacheAge) {
            return cachedImage.localPath;
          } else {
            // Remove arquivo expirado
            await this.removeCachedImage(key);
          }
        } else {
          // Remove entrada do metadata se arquivo não existe
          await this.removeCachedImage(key);
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao obter caminho da imagem:', key, error);
      return null;
    }
  }

  /**
   * Remove uma imagem específica do cache
   */
  async removeCachedImage(key: string): Promise<void> {
    try {
      const metadata = await this.getCacheMetadata();
      const cachedImage = metadata.find(item => item.key === key);

      if (cachedImage) {
        // Remove arquivo físico
        const fileInfo = await FileSystem.getInfoAsync(cachedImage.localPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(cachedImage.localPath);
        }

        // Remove do metadata
        const filteredMetadata = metadata.filter(item => item.key !== key);
        await this.saveCacheMetadata(filteredMetadata);

        console.log('🗑️ Imagem removida do cache:', key);
      }
    } catch (error) {
      console.error('❌ Erro ao remover imagem do cache:', key, error);
    }
  }

  /**
   * Faz cache de múltiplas imagens em lote
   */
  async cacheImages(images: { key: string; url: string }[]): Promise<{ [key: string]: string | null }> {
    const results: { [key: string]: string | null } = {};

    for (const image of images) {
      results[image.key] = await this.cacheImage(image.key, image.url);
    }

    return results;
  }

  /**
   * Obtém informações do cache
   */
  async getCacheInfo(): Promise<{
    totalFiles: number;
    totalSize: number;
    oldestFile: number;
    newestFile: number;
  }> {
    try {
      const metadata = await this.getCacheMetadata();
      
      if (metadata.length === 0) {
        return { totalFiles: 0, totalSize: 0, oldestFile: 0, newestFile: 0 };
      }

      const totalSize = metadata.reduce((sum, item) => sum + item.size, 0);
      const dates = metadata.map(item => item.downloadedAt);
      
      return {
        totalFiles: metadata.length,
        totalSize,
        oldestFile: Math.min(...dates),
        newestFile: Math.max(...dates),
      };
    } catch (error) {
      console.error('❌ Erro ao obter informações do cache:', error);
      return { totalFiles: 0, totalSize: 0, oldestFile: 0, newestFile: 0 };
    }
  }

  /**
   * Limpa cache antigo baseado no tamanho máximo
   */
  async cleanupCache(): Promise<void> {
    try {
      const metadata = await this.getCacheMetadata();
      const cacheInfo = await this.getCacheInfo();

      if (cacheInfo.totalSize > this.maxCacheSize) {
        // Ordena por data (mais antigo primeiro)
        const sortedMetadata = metadata.sort((a, b) => a.downloadedAt - b.downloadedAt);
        
        let currentSize = cacheInfo.totalSize;
        const targetSize = this.maxCacheSize * 0.8; // Remove até 80% do limite

        for (const item of sortedMetadata) {
          if (currentSize <= targetSize) break;
          
          await this.removeCachedImage(item.key);
          currentSize -= item.size;
        }

        console.log('🧹 Cache limpo. Tamanho reduzido para:', currentSize);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }

  /**
   * Limpa todo o cache
   */
  async clearAllCache(): Promise<void> {
    try {
      // Remove diretório inteiro
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.cacheDir);
      }

      // Limpa metadata
      await AsyncStorage.removeItem(this.cacheMetadataKey);

      // Recria diretório
      await this.initializeCache();

      console.log('🧹 Todo o cache foi limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar todo o cache:', error);
    }
  }

  /**
   * Verifica se uma imagem está em cache
   */
  async isImageCached(key: string): Promise<boolean> {
    const path = await this.getCachedImagePath(key);
    return path !== null;
  }

  /**
   * Pré-carrega imagens em background
   */
  async preloadImages(images: { key: string; url: string }[]): Promise<void> {
    console.log('🔄 Pré-carregando', images.length, 'imagens...');
    
    // Limpa cache antigo primeiro
    await this.cleanupCache();

    // Cache as imagens em paralelo (limitado a 3 por vez para não sobrecarregar)
    const chunks = [];
    for (let i = 0; i < images.length; i += 3) {
      chunks.push(images.slice(i, i + 3));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(image => this.cacheImage(image.key, image.url))
      );
    }

    console.log('✅ Pré-carregamento concluído');
  }
}

export default new ImageCacheService();
