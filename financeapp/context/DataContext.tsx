import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Category, Card, Transaction, Goal } from '@/types';

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

  useEffect(() => {
    loadData();
  }, []);

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

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...category, id: generateId() };
    const newData = { ...data, categories: [...data.categories, newCategory] };
    await saveData(newData);
  };

  const updateCategory = async (id: string, categoryUpdate: Partial<Category>) => {
    const newData = {
      ...data,
      categories: data.categories.map(cat => cat.id === id ? { ...cat, ...categoryUpdate } : cat)
    };
    await saveData(newData);
  };

  const deleteCategory = async (id: string) => {
    const newData = {
      ...data,
      categories: data.categories.filter(cat => cat.id !== id)
    };
    await saveData(newData);
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
    const newTransaction: Transaction = { ...transaction, id: generateId() };
    const newData = { ...data, transactions: [...data.transactions, newTransaction] };
    await saveData(newData);
  };

  const updateTransaction = async (id: string, transactionUpdate: Partial<Transaction>) => {
    const newData = {
      ...data,
      transactions: data.transactions.map(trans => trans.id === id ? { ...trans, ...transactionUpdate } : trans)
    };
    await saveData(newData);
  };

  const deleteTransaction = async (id: string) => {
    const newData = {
      ...data,
      transactions: data.transactions.filter(trans => trans.id !== id)
    };
    await saveData(newData);
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
    return data.transactions.reduce((total, transaction) => {
      return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
    }, 0);
  };

  const getMonthlyIncome = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return data.transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transaction.type === 'income' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return data.transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transaction.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getCategoryExpenses = () => {
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