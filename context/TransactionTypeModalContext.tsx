import React, { createContext, useContext, useRef } from 'react';
import { Modalize } from 'react-native-modalize';
import { TransactionTypeModal } from '@/components/TransactionTypeModal';

interface TransactionTypeModalContextType {
  openModal: () => void;
  closeModal: () => void;
}

const TransactionTypeModalContext = createContext<TransactionTypeModalContextType | undefined>(undefined);

export function TransactionTypeModalProvider({ children }: { children: React.ReactNode }) {
  const modalRef = useRef<Modalize>(null);

  const openModal = () => {
    modalRef.current?.open();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  return (
    <TransactionTypeModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <TransactionTypeModal ref={modalRef} />
    </TransactionTypeModalContext.Provider>
  );
}

export function useTransactionTypeModal() {
  const context = useContext(TransactionTypeModalContext);
  if (context === undefined) {
    throw new Error('useTransactionTypeModal must be used within a TransactionTypeModalProvider');
  }
  return context;
}

export { TransactionTypeModalContext };