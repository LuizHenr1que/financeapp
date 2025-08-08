import React, { createContext, useContext, useState, useEffect } from 'react';
import DatabaseService from '../services/DatabaseService';

interface SQLiteContextType {
  isInitialized: boolean;
  initializeDatabase: () => Promise<void>;
  createUser: (name: string, email: string) => Promise<any>;
  createTransaction: (transaction: any) => Promise<any>;
  getTransactions: (userId: number) => Promise<any[]>;
  getTransactionsSummary: (userId: number) => Promise<any>;
}

const SQLiteContext = createContext<SQLiteContextType | undefined>(undefined);

export function SQLiteProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeDatabase = async () => {
    try {
      await DatabaseService.initialize();
      setIsInitialized(true);
      console.log('✅ SQLite Context inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar SQLite Context:', error);
    }
  };

  // Inicializar automaticamente quando o contexto for montado
  useEffect(() => {
    initializeDatabase();
  }, []);

  const createUser = async (name: string, email: string) => {
    try {
      const user = await DatabaseService.createUser(name, email);
      console.log('✅ Usuário criado no SQLite:', user);
      return user;
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  };

  const createTransaction = async (transaction: any) => {
    try {
      const newTransaction = await DatabaseService.createTransaction(transaction);
      console.log('✅ Transação criada no SQLite:', newTransaction);
      return newTransaction;
    } catch (error) {
      console.error('❌ Erro ao criar transação:', error);
      throw error;
    }
  };

  const getTransactions = async (userId: number) => {
    try {
      const transactions = await DatabaseService.getTransactionsByUser(userId);
      console.log(`✅ ${transactions.length} transações encontradas no SQLite`);
      return transactions;
    } catch (error) {
      console.error('❌ Erro ao buscar transações:', error);
      return [];
    }
  };

  const getTransactionsSummary = async (userId: number) => {
    try {
      const summary = await DatabaseService.getTransactionsSummary(userId);
      console.log('✅ Resumo de transações:', summary);
      return summary;
    } catch (error) {
      console.error('❌ Erro ao buscar resumo:', error);
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
      };
    }
  };

  return (
    <SQLiteContext.Provider value={{
      isInitialized,
      initializeDatabase,
      createUser,
      createTransaction,
      getTransactions,
      getTransactionsSummary,
    }}>
      {children}
    </SQLiteContext.Provider>
  );
}

export function useSQLite() {
  const context = useContext(SQLiteContext);
  if (context === undefined) {
    throw new Error('useSQLite deve ser usado dentro de um SQLiteProvider');
  }
  return context;
}
