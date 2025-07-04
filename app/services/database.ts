import * as SQLite from 'expo-sqlite';

const db = (SQLite as any).openDatabase('finances.db');

export const initDb = () => {
  db.transaction((tx: any) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE,
        description TEXT,
        amount REAL,
        type TEXT,
        date TEXT,
        synced INTEGER DEFAULT 0
      );`
    );
  });
};

export const insertTransaction = (tx: {
  uuid: string;
  description: string;
  amount: number;
  type: string;
  date: string;
}) => {
  db.transaction((t: any) => {
    t.executeSql(
      `INSERT INTO transactions (uuid, description, amount, type, date, synced)
       VALUES (?, ?, ?, ?, ?, 0);`,
      [tx.uuid, tx.description, tx.amount, tx.type, tx.date]
    );
  });
};

export const getUnsyncedTransactions = (callback: (data: any[]) => void) => {
  db.transaction((tx: any) => {
    tx.executeSql(
      `SELECT * FROM transactions WHERE synced = 0;`,
      [],
      (_: any, result: any) => callback(result.rows._array)
    );
  });
};

export const markAsSynced = (uuids: string[]) => {
  if (uuids.length === 0) return;
  const placeholders = uuids.map(() => '?').join(',');
  db.transaction((tx: any) => {
    tx.executeSql(
      `UPDATE transactions SET synced = 1 WHERE uuid IN (${placeholders});`,
      uuids
    );
  });
};
