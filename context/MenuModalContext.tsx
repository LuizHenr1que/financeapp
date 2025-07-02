import React, { createContext, useContext, useRef } from 'react';
import { Modalize } from 'react-native-modalize';
import { MenuModal } from '@/components/MenuModal';

interface MenuModalContextType {
  openModal: () => void;
  closeModal: () => void;
}

const MenuModalContext = createContext<MenuModalContextType | undefined>(undefined);

export function MenuModalProvider({ children }: { children: React.ReactNode }) {
  const modalRef = useRef<Modalize>(null);

  const openModal = () => {
    modalRef.current?.open();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  return (
    <MenuModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <MenuModal ref={modalRef} />
    </MenuModalContext.Provider>
  );
}

export function useMenuModal() {
  const context = useContext(MenuModalContext);
  if (context === undefined) {
    throw new Error('useMenuModal must be used within a MenuModalProvider');
  }
  return context;
}

export { MenuModalContext };
