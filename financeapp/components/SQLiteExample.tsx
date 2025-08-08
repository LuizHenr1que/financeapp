import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSQLite } from '../context/SQLiteContext';

export default function SQLiteExample() {
  const { isInitialized, createUser, createTransaction, getTransactions, getTransactionsSummary } = useSQLite();
  
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Exemplo de uso do SQLite
  const handleCreateUser = async () => {
    if (!userName || !userEmail) {
      Alert.alert('Erro', 'Preencha nome e email');
      return;
    }

    try {
      const user = await createUser(userName, userEmail);
      setCurrentUser(user);
      setUserName('');
      setUserEmail('');
      Alert.alert('Sucesso', 'Usuário criado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar usuário');
    }
  };

  const handleCreateTransaction = async () => {
    if (!currentUser) {
      Alert.alert('Erro', 'Crie um usuário primeiro');
      return;
    }

    try {
      const transaction = {
        user_id: currentUser.id,
        description: 'Transação de exemplo',
        amount: Math.random() * 1000,
        type: Math.random() > 0.5 ? 'income' : 'expense',
        category: 'Exemplo',
        date: new Date().toISOString().split('T')[0],
      };

      await createTransaction(transaction);
      loadTransactions();
      Alert.alert('Sucesso', 'Transação criada!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar transação');
    }
  };

  const loadTransactions = async () => {
    if (!currentUser) return;

    try {
      const userTransactions = await getTransactions(currentUser.id);
      const transactionSummary = await getTransactionsSummary(currentUser.id);
      
      setTransactions(userTransactions);
      setSummary(transactionSummary);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadTransactions();
    }
  }, [currentUser]);

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text>Inicializando SQLite...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exemplo SQLite no Expo Go</Text>
      
      {!currentUser ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Criar Usuário</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={userName}
            onChangeText={setUserName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={userEmail}
            onChangeText={setUserEmail}
          />
          <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
            <Text style={styles.buttonText}>Criar Usuário</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usuário: {currentUser.name}</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleCreateTransaction}>
            <Text style={styles.buttonText}>Criar Transação</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={loadTransactions}>
            <Text style={styles.buttonText}>Recarregar Dados</Text>
          </TouchableOpacity>

          {summary.transactionCount > 0 && (
            <View style={styles.summary}>
              <Text>Total de Transações: {summary.transactionCount}</Text>
              <Text>Receitas: R$ {summary.totalIncome?.toFixed(2)}</Text>
              <Text>Despesas: R$ {summary.totalExpense?.toFixed(2)}</Text>
              <Text>Saldo: R$ {summary.balance?.toFixed(2)}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Transações Recentes:</Text>
          {transactions.slice(0, 5).map((transaction, index) => (
            <View key={index} style={styles.transaction}>
              <Text>{transaction.description}</Text>
              <Text style={transaction.type === 'income' ? styles.income : styles.expense}>
                {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount?.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  income: {
    color: 'green',
    fontWeight: 'bold',
  },
  expense: {
    color: 'red',
    fontWeight: 'bold',
  },
});
