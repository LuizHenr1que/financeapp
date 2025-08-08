import * as SQLite from 'expo-sqlite';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface Transaction {
  id: number;
  user_id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  created_at: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize() {
    try {
      // Abre/cria o banco de dados
      this.db = await SQLite.openDatabaseAsync('financeapp.db');
      
      // Cria as tabelas se não existirem
      await this.createTables();
      
      console.log('✅ Banco SQLite inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar banco SQLite:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Tabela de usuários
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de transações
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        category TEXT NOT NULL,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Tabela de categorias
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);
  }

  // CRUD Operations para Usuários
  async createUser(name: string, email: string): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );

    const user = await this.db.getFirstAsync<User>(
      'SELECT * FROM users WHERE id = ?',
      [result.lastInsertRowId]
    );

    if (!user) throw new Error('Failed to create user');
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getFirstAsync<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  }

  // CRUD Operations para Transações
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      'INSERT INTO transactions (user_id, description, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?)',
      [transaction.user_id, transaction.description, transaction.amount, transaction.type, transaction.category, transaction.date]
    );

    const newTransaction = await this.db.getFirstAsync<Transaction>(
      'SELECT * FROM transactions WHERE id = ?',
      [result.lastInsertRowId]
    );

    if (!newTransaction) throw new Error('Failed to create transaction');
    return newTransaction;
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const setParts: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        setParts.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (setParts.length === 0) return false;

    values.push(id);
    
    const result = await this.db.runAsync(
      `UPDATE transactions SET ${setParts.join(', ')} WHERE id = ?`,
      values
    );

    return result.changes > 0;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      'DELETE FROM transactions WHERE id = ?',
      [id]
    );

    return result.changes > 0;
  }

  // Métodos para relatórios
  async getTransactionsSummary(userId: number): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const income = await this.db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = "income"',
      [userId]
    );

    const expense = await this.db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = "expense"',
      [userId]
    );

    const count = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?',
      [userId]
    );

    const totalIncome = income?.total || 0;
    const totalExpense = expense?.total || 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: count?.count || 0,
    };
  }

  // Limpar dados (útil para desenvolvimento)
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync('DELETE FROM transactions');
    await this.db.execAsync('DELETE FROM categories');
    await this.db.execAsync('DELETE FROM users');
    
    console.log('🗑️ Todos os dados foram limpos do SQLite');
  }

  // Fechar conexão
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log('✅ Conexão SQLite fechada');
    }
  }
}

export default new DatabaseService();
