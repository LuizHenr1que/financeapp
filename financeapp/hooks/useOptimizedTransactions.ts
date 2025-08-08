import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Transaction } from '../types';

/**
 * Hook para gerenciar transações com performance otimizada
 * Combina cache, atualizações otimistas e feedback visual
 */
export function useOptimizedTransactions() {
  const {
    data,
    addTransactionOptimistic,
    updateTransactionOptimistic,
    deleteTransactionOptimistic,
    loadTransactions,
    isLoadingTransactions
  } = useData();

  const [isOperating, setIsOperating] = useState(false);

  /**
   * Adiciona uma transação com feedback otimista
   * A UI é atualizada imediatamente, mesmo antes da resposta do servidor
   */
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    setIsOperating(true);
    try {
      await addTransactionOptimistic(transaction);
    } finally {
      setIsOperating(false);
    }
  };

  /**
   * Atualiza uma transação com rollback automático em caso de erro
   * O usuário vê a mudança instantaneamente
   */
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setIsOperating(true);
    try {
      await updateTransactionOptimistic(id, updates);
    } finally {
      setIsOperating(false);
    }
  };

  /**
   * Remove uma transação com possibilidade de desfazer
   * A transação desaparece imediatamente da UI
   */
  const deleteTransaction = async (id: string) => {
    setIsOperating(true);
    try {
      await deleteTransactionOptimistic(id);
    } finally {
      setIsOperating(false);
    }
  };

  /**
   * Força o carregamento das transações do servidor
   * Útil para pull-to-refresh ou sincronização manual
   */
  const refreshTransactions = async () => {
    await loadTransactions();
  };

  /**
   * Obtém estatísticas das transações com cache
   */
  const getTransactionStats = () => {
    const transactions = data.transactions;
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length
    };
  };

  return {
    // Dados
    transactions: data.transactions,
    
    // Estados
    isLoading: isLoadingTransactions,
    isOperating,
    
    // Ações otimizadas
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions,
    
    // Utilitários
    getTransactionStats
  };
}

export default useOptimizedTransactions;
