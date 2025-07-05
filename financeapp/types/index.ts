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
  limit: number;
  currentSpending: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  categoryId: string;
  paymentMethod: 'cash' | 'pix' | 'card';
  cardId?: string;
  installments?: number;
  currentInstallment?: number;
  description: string;
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
  transactions: Transaction[];
  goals: Goal[];
}