import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { theme } from '@/theme';
import BankIcon from './BankIcon';
import { useImageCacheContext } from '../context/ImageCacheContext';
import { ICONS } from './AccountIconSelectorModal';

export default function ImageCacheDemo() {
  const { 
    isInitialized, 
    isPreloading, 
    cacheInfo, 
    clearCache, 
    cleanupCache, 
    refreshCacheInfo 
  } = useImageCacheContext();

  const [selectedBank, setSelectedBank] = useState('c6');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'N/A';
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpar Cache',
      'Tem certeza que deseja limpar todo o cache de imagens?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearCache },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Demo do Cache de Imagens</Text>
      
      {/* Status do Sistema */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status do Sistema</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Inicializado:</Text>
          <Text style={[styles.statusValue, { color: isInitialized ? 'green' : 'red' }]}>
            {isInitialized ? 'Sim' : 'Não'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Pré-carregando:</Text>
          <Text style={[styles.statusValue, { color: isPreloading ? 'orange' : 'green' }]}>
            {isPreloading ? 'Sim' : 'Não'}
          </Text>
        </View>
      </View>

      {/* Informações do Cache */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações do Cache</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Total de arquivos:</Text>
          <Text style={styles.statusValue}>{cacheInfo.totalFiles}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Tamanho total:</Text>
          <Text style={styles.statusValue}>{formatFileSize(cacheInfo.totalSize)}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Arquivo mais antigo:</Text>
          <Text style={styles.statusValue}>{formatDate(cacheInfo.oldestFile)}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Arquivo mais recente:</Text>
          <Text style={styles.statusValue}>{formatDate(cacheInfo.newestFile)}</Text>
        </View>
      </View>

      {/* Demonstração de Ícones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ícones de Bancos (Carregamento Rápido)</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((icon) => (
            <TouchableOpacity
              key={icon.key}
              style={[
                styles.iconButton,
                selectedBank === icon.key && styles.selectedIconButton
              ]}
              onPress={() => setSelectedBank(icon.key)}
            >
              <BankIcon
                bankKey={icon.key}
                size={40}
                showLabel={true}
                labelStyle={styles.iconLabel}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Banco Selecionado */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Banco Selecionado</Text>
        <View style={styles.selectedBankContainer}>
          <BankIcon
            bankKey={selectedBank}
            size={80}
            showLabel={true}
            labelStyle={styles.selectedBankLabel}
          />
        </View>
      </View>

      {/* Controles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controles do Cache</Text>
        
        <TouchableOpacity style={styles.button} onPress={refreshCacheInfo}>
          <Text style={styles.buttonText}>Atualizar Informações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={cleanupCache}>
          <Text style={styles.buttonText}>Otimizar Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearCache}>
          <Text style={styles.buttonText}>Limpar Todo Cache</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ As imagens são baixadas uma vez e armazenadas localmente para carregamento instantâneo. 
          O sistema gerencia automaticamente o tamanho do cache e remove arquivos antigos quando necessário.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: '30%',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedIconButton: {
    backgroundColor: theme.colors.primary + '20',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  iconLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  selectedBankContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  selectedBankLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
});
