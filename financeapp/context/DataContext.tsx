import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Category, Card, Transaction, Goal } from '@/types';
import transactionsService, { CreateTransactionRequest } from '@/src/services/transactions';
import dataService from '@/src/services/data';
import { useAuth } from './AuthContext';

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
  categories: [
    { id: '1', name: 'Alimentação', color: '#ff6b6b', icon: 'utensils', type: 'expense' },
    { id: '2', name: 'Transporte', color: '#4ecdc4', icon: 'car', type: 'expense' },
    { id: '3', name: 'Salário', color: '#45b7d1', icon: 'dollar-sign', type: 'income' },
    { id: '4', name: 'Lazer', color: '#96ceb4', icon: 'gamepad', type: 'expense' },
  ],
  cards: [
    { id: '1', name: 'Cartão Principal', limit: 2000, currentSpending: 850, closingDay: 15, dueDay: 10, color: '#1de9b6' },
    { id: '2', name: 'Cartão Extra', limit: 1000, currentSpending: 230, closingDay: 20, dueDay: 15, color: '#0f2e2a' },
  ],
  accounts: [
    { id: '1', name: 'Conta Corrente', type: 'checking', balance: 2500, color: '#28A745', icon: 'Wallet' },
    { id: '2', name: 'Poupança', type: 'savings', balance: 10000, color: '#007AFF', icon: 'PiggyBank' },
  ],
  transactions: [
    { id: '1', type: 'expense', amount: 120, date: '2025-01-15', categoryId: '1', paymentMethod: 'card', cardId: '1', description: 'Supermercado' },
    { id: '2', type: 'income', amount: 3500, date: '2025-01-01', categoryId: '3', paymentMethod: 'pix', description: 'Salário Janeiro' },
    { id: '3', type: 'expense', amount: 45, date: '2025-01-14', categoryId: '2', paymentMethod: 'pix', description: 'Uber' },
  ],
  goals: [
    { id: '1', name: 'Viagem de Férias', targetAmount: 3000, currentAmount: 1200, deadline: '2025-12-31', color: '#ff6b6b' },
    { id: '2', name: 'Reserva de Emergência', targetAmount: 10000, currentAmount: 6500, deadline: '2025-12-31', color: '#4ecdc4' },
  ],
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadData();
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

  // Carregar transações do backend
  const loadTransactions = async () => {
    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado, não carregando transações do backend');
      return;
    }

    try {
      setIsLoadingTransactions(true);
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
        
        // Mapear os cartões do backend para o formato local
        const mappedCards: Card[] = response.data.cards.map(c => {
          console.log('🎯 Mapeando cartão do backend:', c);
          return {
            id: c.id,
            name: c.name,
            limit: typeof c.limit === 'number' ? c.limit : 0,
            currentSpending: 0, // Valor padrão (não vem do backend ainda)
            closingDay: 5, // Valor padrão (não vem do backend ainda)
            dueDay: 25, // Valor padrão (não vem do backend ainda)
            color: c.color || '#007AFF'
          };
        });

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
          icon: a.icon || 'Wallet'
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
      throw new Error('Já existe uma categoria com esse nome e tipo');
    }
    // Envia para o backend primeiro
    const response = await dataService.createCategory(category);
    if (response.error) {
      throw new Error(response.error);
    }
    // Usa o retorno do backend (com id e userId corretos)
    const newCategory = response.data?.category;
    if (!newCategory) throw new Error('Categoria não retornada pelo backend');
    const newData = { ...data, categories: [...data.categories, newCategory] };
    await saveData(newData);
  };

  const updateCategory = async (id: string, categoryUpdate: Partial<Category>) => {
    // Impede duplicidade ao editar (exceto a própria)
    if (categoryUpdate.name && categoryUpdate.type) {
      const exists = data.categories.some(
        c => c.id !== id && c.name.trim().toLowerCase() === categoryUpdate.name!.trim().toLowerCase() && c.type === categoryUpdate.type
      );
      if (exists) {
        throw new Error('Já existe uma categoria com esse nome e tipo');
      }
    }
    const newData = {
      ...data,
      categories: data.categories.map(cat => cat.id === id ? { ...cat, ...categoryUpdate } : cat)
    };
    await saveData(newData);
  };

  const deleteCategory = async (id: string) => {
    // Exclui do backend primeiro
    const response = await dataService.deleteCategory(id);
    if (response.error) {
      throw new Error(response.error);
    }
    // Após excluir, recarrega do backend para garantir sincronização
    await loadCategories();
  };

  const addCard = async (card: Omit<Card, 'id'>) => {
    const newCard: Card = { ...card, id: generateId() };
    const newData = { ...data, cards: [...data.cards, newCard] };
    await saveData(newData);
  };

  const updateCard = async (id: string, cardUpdate: Partial<Card>) => {
    const newData = {
      ...data,
      cards: data.cards.map(card => card.id === id ? { ...card, ...cardUpdate } : card)
    };
    await saveData(newData);
  };

  const deleteCard = async (id: string) => {
    const newData = {
      ...data,
      cards: data.cards.filter(card => card.id !== id)
    };
    await saveData(newData);
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
        accountId: transaction.cardId || '', // Usar cardId como accountId
        cardId: transaction.cardId,
        paymentMethod: transaction.paymentMethod,
        launchType: transaction.launchType,
        installments: transaction.installments,
        valorComoParcela: transaction.valorComoParcela,
        recurrenceType: transaction.recurrenceType
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

        // Atualizar o estado local com as novas transações
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
      const amount = Number(transaction.amount) || 0;
      return transaction.type === 'income' ? total + amount : total - amount;
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
        const transactionDate = new Date(transaction.date);
        return transaction.type === 'income' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
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
        const transactionDate = new Date(transaction.date);
        return transaction.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
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
        const transactionDate = new Date(transaction.date);
        return transaction.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .forEach(transaction => {
        if (categoryTotals[transaction.categoryId]) {
          categoryTotals[transaction.categoryId] += transaction.amount;
        } else {
          categoryTotals[transaction.categoryId] = transaction.amount;
        }
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