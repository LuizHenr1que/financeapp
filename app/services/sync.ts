import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { getUnsyncedTransactions, markAsSynced } from './database';

export const setupSyncListener = () => {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      syncTransactions();
    }
  });
};

export const syncTransactions = async () => {
  getUnsyncedTransactions(async (transactions) => {
    if (transactions.length === 0) return;

    try {
      await axios.post('http://SEU_BACKEND_API/transactions', {
        transactions,
      });

      const uuids = transactions.map(tx => tx.uuid);
      markAsSynced(uuids);
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  });
};
