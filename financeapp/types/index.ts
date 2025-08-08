export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isPremium: boolean;
  premiumPlan?: string;
  premiumStartDate?: string;
  premiumEndDate?: string;
  createdAt: string;
  updatedAt: string;
  role?: string; // Adicionado para badge dinâmico
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
}

export interface Card {
  id: string;
  name: string;
  type?: 'credit' | 'debit';
  icon?: string;
  limit?: number;
  currentSpending?: number;
  closingDay?: number;
  dueDay?: number;
  userId?: string;
  accountId?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  icon: string;
  includeInTotal: boolean; // Adicionado para checkbox
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  categoryId: string;
  accountId?: string; // Novo campo para compatibilidade com backend
  paymentMethod: 'cash' | 'pix' | 'card';
  cardId?: string;
  installments?: number;
  currentInstallment?: number;
  description: string;
  
  // Novos campos para parcelamento e lançamentos
  title?: string;
  launchType?: 'unico' | 'recorrente' | 'parcelado';
  valorComoParcela?: boolean;
  recurrenceType?: 'Anual' | 'Mensal' | 'Semanal';
  parentTransactionId?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
}

export interface AppData {
  categories: Category[];
  cards: Card[];
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
}