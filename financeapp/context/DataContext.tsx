import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Category, Card, Transaction, Goal } from '@/types';
import transactionsService, { CreateTransactionRequest } from '@/src/services/transactions';
import dataService from '@/src/services/data';
import { useAuth } from './AuthContext';
import Toast from 'react-native-toast-message';
import { preloadAccountIcons } from '@/components/AccountIconSelectorModal';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface DataContextType {
  data: AppData;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addCard: (card: Omit<Card, 'id'>) => Promise<void>;
  updateCard: (id: string, card: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addTransactionOptimistic: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransactionOptimistic: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransactionOptimistic: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getCategoryExpenses: () => { name: string; amount: number; color: string }[];
  loadTransactions: () => Promise<void>;
  isLoadingTransactions: boolean;
}

const initialData: AppData = {
  categories: [],
  cards: [],
  accounts: [],
  transactions: [],
  goals: [],
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { isAuthenticated } = useAuth();
  
  // Inicializa sincronização em background
  const backgroundSync = useBackgroundSync();
  
  // Monitora status de rede
  const { updateSyncStatus, canPerformOnlineActions } = useNetworkStatus();

  // Cache TTL (Time To Live) - 5 minutos
  const CACHE_TTL = 5 * 60 * 1000;

  // Funções de cache otimizadas
  const getCacheKey = (type: string) => `${type}_cache`;
  const getSyncKey = (type: string) => `${type}_last_sync`;

  const loadFromCache = async (type: string): Promise<any[] | null> => {
    try {
      const cacheKey = getCacheKey(type);
      const syncKey = getSyncKey(type);
      
      const [cached, syncTime] = await Promise.all([
        AsyncStorage.getItem(cacheKey),
        AsyncStorage.getItem(syncKey)
      ]);

      if (cached && syncTime) {
        const lastSyncTime = new Date(syncTime);
        const now = new Date();

        // Se o cache é recente, usa ele
        if (now.getTime() - lastSyncTime.getTime() < CACHE_TTL) {
          console.log(`✅ Carregando ${type} do cache`);
          return JSON.parse(cached);
        }
      }
      return null;
    } catch (error) {
      console.error(`Erro ao carregar cache de ${type}:`, error);
      return null;
    }
  };

  const saveToCache = async (type: string, data: any[]) => {
    try {
      const cacheKey = getCacheKey(type);
      const syncKey = getSyncKey(type);
      
      await Promise.all([
        AsyncStorage.setItem(cacheKey, JSON.stringify(data)),
        AsyncStorage.setItem(syncKey, new Date().toISOString())
      ]);
      
      console.log(`💾 ${type} salvo no cache`);
    } catch (error) {
      console.error(`Erro ao salvar cache de ${type}:`, error);
    }
  };

  useEffect(() => {
    loadData();
    
    // Pré-carregar ícones de bancos logo no início
    const initializeImages = async () => {
      console.log('🚀 Inicializando cache de imagens...');
      await preloadAccountIcons();
    };
    initializeImages();
    
    // Carregar dados do backend se o usuário estiver autenticado
    if (isAuthenticated) {
      loadTransactions();
      loadCategories();
      loadCards();
      loadAccounts();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('appData');
      if (storedData) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (newData: AppData) => {
    try {
      await AsyncStorage.setItem('appData', JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const generateId = () => Date.now().toString();

  // Carregar transações do backend com cache
  const loadTransactions = async (forceRefresh: boolean = false) => {
    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado, não carregando transações do backend');
      return;
    }

    try {
      setIsLoadingTransactions(true);
      
      // Tenta carregar do cache primeiro
      if (!forceRefresh) {
        const cachedTransactions = await loadFromCache('transactions');
        if (cachedTransactions) {
          setData(prev => ({ ...prev, transactions: cachedTransactions }));
          setIsLoadingTransactions(false);
          return;
        }
      }

      console.log('📡 Carregando transações do backend...');
      
      const response = await transactionsService.getTransactions();
      
      if (response.error) {
        console.error('❌ Erro ao carregar transações:', response.error);
        return;
      }

      if (response.data?.transactions) {
        console.log(`✅ ${response.data.transactions.length} transações carregadas do backend`);
        
        // Mapear as transações do backend para o formato local
        const mappedTransactions: Transaction[] = response.data.transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          title: t.title,
          description: t.description,
          date: t.date,
          categoryId: t.categoryId,
          paymentMethod: (t.paymentMethod || 'cash') as 'cash' | 'pix' | 'card',
          cardId: t.cardId,
          launchType: t.launchType,
          installments: t.installments,
          valorComoParcela: t.valorComoParcela,
          recurrenceType: t.recurrenceType,
          currentInstallment: t.currentInstallment,
          parentTransactionId: t.parentTransactionId
        }));

        setData(prevData => ({
          ...prevData,
          transactions: mappedTransactions
        }));

        // Salva no cache
        await saveToCache('transactions', mappedTransactions);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Carregar categorias do backend
  const loadCategories = async () => {
    if (!isAuthenticated || isLoadingCategories) {
      console.log('❌ Usuário não autenticado ou já carregando categorias');
      return;
    }

    try {
      setIsLoadingCategories(true);
      console.log('📂 Carregando categorias do backend...');
      
      const response = await dataService.getCategories();
      
      if (response.error) {
        console.error('❌ Erro ao carregar categorias:', response.error);
        return;
      }

      if (response.data?.categories) {
        console.log(`✅ ${response.data.categories.length} categorias carregadas do backend`);
        
        // Mapear as categorias do backend para o formato local
        const mappedCategories: Category[] = response.data.categories.map(c => ({
          id: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon,
          type: c.type
        }));

        setData(prevData => ({
          ...prevData,
          categories: mappedCategories
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Carregar cartões do backend
  const loadCards = async () => {
    if (!isAuthenticated || isLoadingCards) {
      console.log('❌ Usuário não autenticado ou já carregando cartões');
      return;
    }

    try {
      setIsLoadingCards(true);
      console.log('💳 Carregando cartões do backend...');
      
      const response = await dataService.getCards();
      
      if (response.error) {
        console.error('❌ Erro ao carregar cartões:', response.error);
        return;
      }

      if (response.data?.cards) {
        console.log(`✅ ${response.data.cards.length} cartões carregados do backend`);
        // Mapear os cartões do backend para o formato local, mantendo todos os campos recebidos
        const mappedCards: Card[] = response.data.cards
          .filter((c: any) => c && c.id) // Filtra cartões válidos
          .map((c: any) => ({
            id: c.id,
            name: c.name || 'Cartão sem nome',
            type: c.type || 'credit',
            icon: c.icon || '',
            limit: c.limit ? Number(c.limit) : 0,
            currentSpending: typeof c.currentSpending === 'number' ? c.currentSpending : 0,
            closingDay: c.closingDay ? Number(c.closingDay) : 1,
            dueDay: c.dueDay ? Number(c.dueDay) : 1,
            userId: c.userId || '',
            accountId: c.accountId || '',
            createdAt: c.createdAt || null,
            updatedAt: c.updatedAt || null
          }));

        setData(prevData => ({
          ...prevData,
          cards: mappedCards
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cartões:', error);
    } finally {
      setIsLoadingCards(false);
    }
  };

  // Carregar contas do backend
  const loadAccounts = async () => {
    if (!isAuthenticated || isLoadingAccounts) {
      console.log('❌ Usuário não autenticado ou já carregando contas');
      return;
    }

    try {
      setIsLoadingAccounts(true);
      console.log('🏦 Carregando contas do backend...');
      
      const response = await dataService.getAccounts();
      
      if (response.error) {
        console.error('❌ Erro ao carregar contas:', response.error);
        return;
      }

      if (response.data?.accounts) {
        console.log(`✅ ${response.data.accounts.length} contas carregadas do backend`);
        
        // Mapear as contas do backend para o formato local (usando Account do types)
        const mappedAccounts = response.data.accounts.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type,
          balance: a.balance,
          color: a.color || '#28A745',
          icon: a.icon || 'Wallet',
          includeInTotal: typeof a.includeInTotal === 'boolean' ? a.includeInTotal : true // valor padrão true
        }));

        setData(prevData => ({
          ...prevData,
          accounts: mappedAccounts
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar contas:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    // Impede categorias duplicadas (mesmo nome e tipo)
    const exists = data.categories.some(
      c => c.name.trim().toLowerCase() === category.name.trim().toLowerCase() && c.type === category.type
    );
    if (exists) {
      Toast.show({ type: 'error', text1: 'Já existe uma categoria com esse nome e tipo' });
      throw new Error('Já existe uma categoria com esse nome e tipo');
    }
    // Envia para o backend primeiro
    const response = await dataService.createCategory(category);
    if (response.error) {
      Toast.show({ type: 'error', text1: response.error });
      throw new Error(response.error);
    }
    // Usa o retorno do backend (com id e userId corretos)
    const newCategory = response.data?.category;
    if (!newCategory) {
      Toast.show({ type: 'error', text1: 'Categoria não retornada pelo backend' });
      throw new Error('Categoria não retornada pelo backend');
    }
    const newData = { ...data, categories: [...data.categories, newCategory] };
    await saveData(newData);
    Toast.show({ type: 'success', text1: response.message || 'Categoria criada com sucesso' });
  };

  const updateCategory = async (id: string, categoryUpdate: Partial<Category>) => {
    // Impede duplicidade ao editar (exceto a própria)
    if (categoryUpdate.name && categoryUpdate.type) {
      const exists = data.categories.some(
        c => c.id !== id && c.name.trim().toLowerCase() === categoryUpdate.name!.trim().toLowerCase() && c.type === categoryUpdate.type
      );
      if (exists) {
        Toast.show({ type: 'error', text1: 'Já existe uma categoria com esse nome e tipo' });
        throw new Error('Já existe uma categoria com esse nome e tipo');
      }
    }
    // Atualiza no backend primeiro
    const response = await dataService.updateCategory(id, categoryUpdate);
    if (response.error) {
      Toast.show({ type: 'error', text1: response.error });
      throw new Error(response.error);
    }
    Toast.show({ type: 'success', text1: response.message || 'Categoria atualizada com sucesso' });
    // Após atualizar, recarrega do backend para garantir sincronização
    await loadCategories();
  };

  const deleteCategory = async (id: string) => {
    // Exclui do backend primeiro
    const response = await dataService.deleteCategory(id);
    if (response.error) {
      Toast.show({ type: 'error', text1: response.error });
      throw new Error(response.error);
    }
    Toast.show({ type: 'success', text1: typeof response.message === 'string' ? response.message : 'Categoria excluída com sucesso' });
    // Após excluir, recarrega do backend para garantir sincronização
    await loadCategories();
  };

  const addCard = async (card: Omit<Card, 'id'>) => {
    // Envia para o backend
    const response = await dataService.addCard(card as any);
    if (response.error) {
      Toast.show({ type: 'error', text1: 'Erro ao adicionar cartão', text2: response.error });
      return;
    }
    // Atualiza local após sucesso
    await loadCards();
    Toast.show({ type: 'success', text1: 'Cartão adicionado com sucesso!' });
  };

  const updateCard = async (id: string, cardUpdate: Partial<Card>) => {
    const response = await dataService.updateCard(id, cardUpdate);
    if (response.error) {
      Toast.show({ type: 'error', text1: 'Erro ao atualizar cartão', text2: response.error });
      return;
    }
    await loadCards();
    Toast.show({ type: 'success', text1: 'Cartão atualizado com sucesso!' });
  };

  const deleteCard = async (id: string) => {
    const response = await dataService.deleteCard(id);
    if (response.error) {
      Toast.show({ type: 'error', text1: 'Erro ao excluir cartão', text2: response.error });
      return;
    }
    await loadCards();
    Toast.show({ type: 'success', text1: 'Cartão excluído com sucesso!' });
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado, não é possível adicionar transação');
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('📤 Enviando transação para o backend...');
      
      // Mapear dados para o formato esperado pelo backend
      const transactionRequest: CreateTransactionRequest = {
        type: transaction.type,
        amount: transaction.amount,
        title: transaction.title,
        description: transaction.description,
        date: transaction.date,
        categoryId: transaction.categoryId,
        paymentMethod: transaction.paymentMethod,
        launchType: transaction.launchType,
        installments: transaction.installments,
        valorComoParcela: transaction.valorComoParcela,
        recurrenceType: transaction.recurrenceType,
        ...(transaction.accountId && transaction.accountId !== '' ? { accountId: transaction.accountId } : {}),
        ...(transaction.cardId && transaction.cardId !== '' ? { cardId: transaction.cardId } : {}),
      };

      const response = await transactionsService.createTransaction(transactionRequest);
      
      if (response.error) {
        console.error('❌ Erro ao criar transação no backend:', response.error);
        throw new Error(response.error);
      }

      if (response.data?.transactions) {
        console.log(`✅ ${response.data.transactions.length} transação(ões) criada(s) no backend`);
        
        // Mapear as transações retornadas do backend para o formato local
        const mappedTransactions: Transaction[] = response.data.transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          title: t.title,
          description: t.description,
          date: t.date,
          categoryId: t.categoryId,
          paymentMethod: (t.paymentMethod || 'cash') as 'cash' | 'pix' | 'card',
          cardId: t.cardId,
          launchType: t.launchType,
          installments: t.installments,
          valorComoParcela: t.valorComoParcela,
          recurrenceType: t.recurrenceType,
          currentInstallment: t.currentInstallment,
          parentTransactionId: t.parentTransactionId
        }));

        setData(prevData => ({
          ...prevData,
          transactions: [...prevData.transactions, ...mappedTransactions]
        }));

        console.log('✅ Transações adicionadas ao estado local');
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar transação:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, transactionUpdate: Partial<Transaction>) => {
    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado, não é possível atualizar transação');
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('📤 Atualizando transação no backend...', { id, ...transactionUpdate });

      // Mapear dados para o formato esperado pelo backend
      const updateRequest: Partial<CreateTransactionRequest> = {};
      
      if (transactionUpdate.type) updateRequest.type = transactionUpdate.type;
      if (transactionUpdate.amount) updateRequest.amount = transactionUpdate.amount;
      if (transactionUpdate.title !== undefined) updateRequest.title = transactionUpdate.title;
      if (transactionUpdate.description) updateRequest.description = transactionUpdate.description;
      if (transactionUpdate.date) updateRequest.date = transactionUpdate.date;
      if (transactionUpdate.categoryId) updateRequest.categoryId = transactionUpdate.categoryId;
      if (transactionUpdate.cardId) updateRequest.accountId = transactionUpdate.cardId;
      if (transactionUpdate.cardId) updateRequest.cardId = transactionUpdate.cardId;
      if (transactionUpdate.paymentMethod) updateRequest.paymentMethod = transactionUpdate.paymentMethod;
      if (transactionUpdate.launchType) updateRequest.launchType = transactionUpdate.launchType;
      if (transactionUpdate.installments) updateRequest.installments = transactionUpdate.installments;
      if (transactionUpdate.valorComoParcela !== undefined) updateRequest.valorComoParcela = transactionUpdate.valorComoParcela;
      if (transactionUpdate.recurrenceType) updateRequest.recurrenceType = transactionUpdate.recurrenceType;

      const response = await transactionsService.updateTransaction(id, updateRequest);
      
      if (response.error) {
        console.error('❌ Erro ao atualizar transação no backend:', response.error);
        throw new Error(response.error);
      }

      if (response.data?.transaction) {
        console.log('✅ Transação atualizada no backend');
        
        // Mapear a transação retornada do backend para o formato local
        const mappedTransaction: Transaction = {
          id: response.data.transaction.id,
          type: response.data.transaction.type,
          amount: response.data.transaction.amount,
          title: response.data.transaction.title,
          description: response.data.transaction.description,
          date: response.data.transaction.date,
          categoryId: response.data.transaction.categoryId,
          paymentMethod: (response.data.transaction.paymentMethod || 'cash') as 'cash' | 'pix' | 'card',
          cardId: response.data.transaction.cardId,
          launchType: response.data.transaction.launchType,
          installments: response.data.transaction.installments,
          valorComoParcela: response.data.transaction.valorComoParcela,
          recurrenceType: response.data.transaction.recurrenceType,
          currentInstallment: response.data.transaction.currentInstallment,
          parentTransactionId: response.data.transaction.parentTransactionId
        };

        // Atualizar o estado local
        setData(prevData => ({
          ...prevData,
          transactions: prevData.transactions.map(trans => 
            trans.id === id ? mappedTransaction : trans
          )
        }));

        console.log('✅ Transação atualizada no estado local');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar transação:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado, não é possível deletar transação');
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('📤 Deletando transação no backend...', id);

      const response = await transactionsService.deleteTransaction(id);
      
      if (response.error) {
        console.error('❌ Erro ao deletar transação no backend:', response.error);
        throw new Error(response.error);
      }

      console.log('✅ Transação deletada no backend');

      // Atualizar o estado local
      setData(prevData => ({
        ...prevData,
        transactions: prevData.transactions.filter(trans => trans.id !== id)
      }));

      console.log('✅ Transação removida do estado local');
    } catch (error) {
      console.error('❌ Erro ao deletar transação:', error);
      throw error;
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = { ...goal, id: generateId() };
    const newData = { ...data, goals: [...data.goals, newGoal] };
    await saveData(newData);
  };

  const updateGoal = async (id: string, goalUpdate: Partial<Goal>) => {
    const newData = {
      ...data,
      goals: data.goals.map(goal => goal.id === id ? { ...goal, ...goalUpdate } : goal)
    };
    await saveData(newData);
  };

  const deleteGoal = async (id: string) => {
    const newData = {
      ...data,
      goals: data.goals.filter(goal => goal.id !== id)
    };
    await saveData(newData);
  };

  const getTotalBalance = () => {
    if (!data.transactions || !Array.isArray(data.transactions) || data.transactions.length === 0) {
      return 0;
    }
    
    const balance = data.transactions.reduce((total, transaction) => {
      return total + (Number(transaction.amount) || 0);
    }, 0);
    
    return Number(balance) || 0;
  };

  const getMonthlyIncome = () => {
    if (!data.transactions || data.transactions.length === 0) {
      return 0;
    }
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const income = data.transactions
      .filter(transaction => {
        const date = new Date(transaction.date);
        return transaction.type === 'income' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + (Number(transaction.amount) || 0), 0);
      
    return Number(income) || 0;
  };

  const getMonthlyExpenses = () => {
    if (!data.transactions || data.transactions.length === 0) {
      return 0;
    }
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const expenses = data.transactions
      .filter(transaction => {
        const date = new Date(transaction.date);
        return transaction.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + (Number(transaction.amount) || 0), 0);
      
    return Number(expenses) || 0;
  };

  const getCategoryExpenses = () => {
    if (!data.transactions || data.transactions.length === 0) {
      return [];
    }
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const categoryTotals: { [key: string]: number } = {};
    
    data.transactions
      .filter(transaction => {
        const date = new Date(transaction.date);
        return transaction.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .forEach(transaction => {
        const amount = Number(transaction.amount) || 0;
        if (!categoryTotals[transaction.categoryId]) {
          categoryTotals[transaction.categoryId] = 0;
        }
        categoryTotals[transaction.categoryId] += amount;
      });

    return Object.entries(categoryTotals).map(([categoryId, amount]) => {
      const category = data.categories.find(cat => cat.id === categoryId);
      return {
        name: category?.name || 'Desconhecido',
        amount,
        color: category?.color || '#cccccc',
      };
    });
  };

  // ===== OPERAÇÕES OTIMISTAS =====
  
  const addTransactionOptimistic = async (transaction: Omit<Transaction, 'id'>) => {
    const tempId = `temp_${Date.now()}`;
    const optimisticTransaction: Transaction = {
      ...transaction,
      id: tempId
    };

    // 1. Atualiza UI imediatamente
    setData(prev => ({
      ...prev,
      transactions: [optimisticTransaction, ...prev.transactions]
    }));

    try {
      // 2. Verifica conectividade antes de tentar enviar
      if (!canPerformOnlineActions) {
        Toast.show({
          type: 'info',
          text1: 'Sem conexão',
          text2: 'Transação será sincronizada quando conectar',
          visibilityTime: 3000
        });
        return; // Mantém a transação otimista na UI
      }

      // 3. Envia para o backend
      const response = await transactionsService.createTransaction(transaction);
      
      if (response.data?.transactions && response.data.transactions.length > 0) {
        // 4. Substitui a transação temporária pela real
        const newTransaction = response.data.transactions[0];
        const mappedTransaction: Transaction = {
          id: newTransaction.id,
          type: newTransaction.type,
          amount: newTransaction.amount,
          title: newTransaction.title,
          description: newTransaction.description,
          date: newTransaction.date,
          categoryId: newTransaction.categoryId,
          paymentMethod: (newTransaction.paymentMethod || 'cash') as 'cash' | 'pix' | 'card',
          cardId: newTransaction.cardId,
          launchType: newTransaction.launchType,
          installments: newTransaction.installments,
          valorComoParcela: newTransaction.valorComoParcela,
          recurrenceType: newTransaction.recurrenceType,
          currentInstallment: newTransaction.currentInstallment,
          parentTransactionId: newTransaction.parentTransactionId
        };

        setData(prev => ({
          ...prev,
          transactions: prev.transactions.map(t => 
            t.id === tempId ? mappedTransaction : t
          )
        }));
        
        // 5. Limpa cache para forçar refresh
        await AsyncStorage.removeItem(getCacheKey('transactions'));
        await updateSyncStatus({ lastSync: new Date() });
        
        Toast.show({
          type: 'success',
          text1: 'Transação adicionada!',
          visibilityTime: 2000
        });
      }
    } catch (error) {
      // 6. Se falhar, remove a transação otimista
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== tempId)
      }));
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao adicionar transação',
        text2: 'Verifique sua conexão e tente novamente'
      });
    }
  };

  const updateTransactionOptimistic = async (id: string, updates: Partial<Transaction>) => {
    // 1. Salva estado anterior
    const oldTransaction = data.transactions.find(t => t.id === id);
    if (!oldTransaction) return;
    
    // 2. Atualiza UI imediatamente
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === id ? { ...t, ...updates } : t
      )
    }));

    try {
      // 3. Envia para o backend
      const response = await transactionsService.updateTransaction(id, updates);
      
      if (response.data?.transaction) {
        // 4. Substitui pela transação real do backend
        const updatedTransaction = response.data.transaction;
        const mappedTransaction: Transaction = {
          id: updatedTransaction.id,
          type: updatedTransaction.type,
          amount: updatedTransaction.amount,
          title: updatedTransaction.title,
          description: updatedTransaction.description,
          date: updatedTransaction.date,
          categoryId: updatedTransaction.categoryId,
          paymentMethod: (updatedTransaction.paymentMethod || 'cash') as 'cash' | 'pix' | 'card',
          cardId: updatedTransaction.cardId,
          launchType: updatedTransaction.launchType,
          installments: updatedTransaction.installments,
          valorComoParcela: updatedTransaction.valorComoParcela,
          recurrenceType: updatedTransaction.recurrenceType,
          currentInstallment: updatedTransaction.currentInstallment,
          parentTransactionId: updatedTransaction.parentTransactionId
        };

        setData(prev => ({
          ...prev,
          transactions: prev.transactions.map(t => 
            t.id === id ? mappedTransaction : t
          )
        }));
        
        // 5. Limpa cache
        await AsyncStorage.removeItem(getCacheKey('transactions'));
        
        Toast.show({
          type: 'success',
          text1: 'Transação atualizada!',
          visibilityTime: 2000
        });
      }
    } catch (error) {
      // 6. Se falhar, reverte para estado anterior
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => 
          t.id === id ? oldTransaction : t
        )
      }));
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar transação',
        text2: 'Tente novamente'
      });
    }
  };

  const deleteTransactionOptimistic = async (id: string) => {
    // 1. Salva transação para rollback
    const deletedTransaction = data.transactions.find(t => t.id === id);
    if (!deletedTransaction) return;
    
    // 2. Remove da UI imediatamente
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));

    try {
      // 3. Envia para o backend
      await transactionsService.deleteTransaction(id);
      
      // 4. Limpa cache
      await AsyncStorage.removeItem(getCacheKey('transactions'));
      
      Toast.show({
        type: 'success',
        text1: 'Transação removida!',
        visibilityTime: 2000
      });
    } catch (error) {
      // 5. Se falhar, adiciona a transação de volta
      setData(prev => ({
        ...prev,
        transactions: [...prev.transactions, deletedTransaction].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }));
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao remover transação',
        text2: 'Tente novamente'
      });
    }
  };

  return (
    <DataContext.Provider value={{
      data,
      addCategory,
      updateCategory,
      deleteCategory,
      addCard,
      updateCard,
      deleteCard,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addTransactionOptimistic,
      updateTransactionOptimistic,
      deleteTransactionOptimistic,
      addGoal,
      updateGoal,
      deleteGoal,
      getTotalBalance,
      getMonthlyIncome,
      getMonthlyExpenses,
      getCategoryExpenses,
      loadTransactions,
      isLoadingTransactions,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}