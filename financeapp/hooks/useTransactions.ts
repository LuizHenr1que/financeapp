import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/types';
import transactionsService from '@/src/services/transactions';
import Toast from 'react-native-toast-message';

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  loadTransactions: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  addTransactionOptimistic: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransactionOptimistic: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransactionOptimistic: (id: string) => Promise<void>;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const PAGE_SIZE = 20;

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Cache management
  const getCacheKey = (pageNum: number) => `transactions_page_${pageNum}`;
  const getLastSyncKey = () => 'transactions_last_sync';

  const loadFromCache = useCallback(async (pageNum: number): Promise<Transaction[] | null> => {
    try {
      const cacheKey = getCacheKey(pageNum);
      const syncKey = getLastSyncKey();
      
      const [cached, syncTime] = await Promise.all([
        AsyncStorage.getItem(cacheKey),
        AsyncStorage.getItem(syncKey)
      ]);

      if (cached && syncTime) {
        const lastSyncTime = new Date(syncTime);
        const now = new Date();

        // Se o cache é recente, usa ele
        if (now.getTime() - lastSyncTime.getTime() < CACHE_TTL) {
          return JSON.parse(cached);
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao carregar cache:', error);
      return null;
    }
  }, []);

  const saveToCache = useCallback(async (pageNum: number, data: Transaction[]) => {
    try {
      const cacheKey = getCacheKey(pageNum);
      const syncKey = getLastSyncKey();
      
      await Promise.all([
        AsyncStorage.setItem(cacheKey, JSON.stringify(data)),
        AsyncStorage.setItem(syncKey, new Date().toISOString())
      ]);
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  }, []);

  const loadTransactions = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    if (loading && !isRefresh) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Se não é refresh, tenta carregar do cache primeiro
      if (!isRefresh) {
        const cachedData = await loadFromCache(pageNum);
        if (cachedData && cachedData.length > 0) {
          if (pageNum === 1) {
            setTransactions(cachedData);
          } else {
            setTransactions(prev => [...prev, ...cachedData]);
          }
          setPage(pageNum);
          return;
        }
      }

      // Carrega do backend
      const response = await transactionsService.getTransactions();
      
      if (response.data?.transactions) {
        const newTransactions = response.data.transactions.slice(
          (pageNum - 1) * PAGE_SIZE,
          pageNum * PAGE_SIZE
        );

        // Salva no cache
        await saveToCache(pageNum, newTransactions);

        if (pageNum === 1 || isRefresh) {
          setTransactions(newTransactions);
        } else {
          setTransactions(prev => [...prev, ...newTransactions]);
        }

        setPage(pageNum);
        setHasMore(newTransactions.length === PAGE_SIZE);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar transações',
        text2: 'Tente novamente'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, loadFromCache, saveToCache]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await loadTransactions(page + 1);
    }
  }, [hasMore, loading, page, loadTransactions]);

  const refresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    // Limpa cache ao fazer refresh
    try {
      const keys = await AsyncStorage.getAllKeys();
      const transactionKeys = keys.filter(key => key.startsWith('transactions_page_'));
      await AsyncStorage.multiRemove([...transactionKeys, getLastSyncKey()]);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
    await loadTransactions(1, true);
  }, [loadTransactions]);

  // Operações otimistas
  const addTransactionOptimistic = useCallback(async (newTransaction: Omit<Transaction, 'id'>) => {
    const tempId = `temp_${Date.now()}`;
    const optimisticTransaction: Transaction = {
      ...newTransaction,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Atualiza UI imediatamente
    setTransactions(prev => [optimisticTransaction, ...prev]);

    try {
      // 2. Envia para o backend
      const response = await transactionsService.createTransaction(newTransaction);
      
      if (response.data?.transaction) {
        // 3. Substitui a transação temporária pela real
        setTransactions(prev => 
          prev.map(t => t.id === tempId ? response.data.transaction : t)
        );
        
        // 4. Limpa cache para forçar refresh
        await AsyncStorage.removeItem(getCacheKey(1));
        
        Toast.show({
          type: 'success',
          text1: 'Transação adicionada!',
          visibilityTime: 2000
        });
      }
    } catch (error) {
      // 5. Se falhar, remove a transação otimista
      setTransactions(prev => prev.filter(t => t.id !== tempId));
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao adicionar transação',
        text2: 'Tente novamente'
      });
    }
  }, []);

  const updateTransactionOptimistic = useCallback(async (id: string, updates: Partial<Transaction>) => {
    // 1. Salva estado anterior
    const previousTransactions = [...transactions];
    
    // 2. Atualiza UI imediatamente
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)
    );

    try {
      // 3. Envia para o backend
      const response = await transactionsService.updateTransaction(id, updates);
      
      if (response.data?.transaction) {
        // 4. Substitui pela transação real do backend
        setTransactions(prev => 
          prev.map(t => t.id === id ? response.data.transaction : t)
        );
        
        // 5. Limpa cache
        await AsyncStorage.removeItem(getCacheKey(1));
        
        Toast.show({
          type: 'success',
          text1: 'Transação atualizada!',
          visibilityTime: 2000
        });
      }
    } catch (error) {
      // 6. Se falhar, reverte para estado anterior
      setTransactions(previousTransactions);
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar transação',
        text2: 'Tente novamente'
      });
    }
  }, [transactions]);

  const deleteTransactionOptimistic = useCallback(async (id: string) => {
    // 1. Salva estado anterior
    const previousTransactions = [...transactions];
    const transactionToDelete = transactions.find(t => t.id === id);
    
    // 2. Remove da UI imediatamente
    setTransactions(prev => prev.filter(t => t.id !== id));

    try {
      // 3. Envia para o backend
      await transactionsService.deleteTransaction(id);
      
      // 4. Limpa cache
      await AsyncStorage.removeItem(getCacheKey(1));
      
      Toast.show({
        type: 'success',
        text1: 'Transação removida!',
        visibilityTime: 2000
      });
    } catch (error) {
      // 5. Se falhar, reverte para estado anterior
      setTransactions(previousTransactions);
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao remover transação',
        text2: 'Tente novamente'
      });
    }
  }, [transactions]);

  // Carrega dados iniciais
  useEffect(() => {
    loadTransactions(1);
  }, []);

  return {
    transactions,
    loading,
    refreshing,
    hasMore,
    loadTransactions: () => loadTransactions(1),
    loadMore,
    refresh,
    addTransactionOptimistic,
    updateTransactionOptimistic,
    deleteTransactionOptimistic
  };
}
