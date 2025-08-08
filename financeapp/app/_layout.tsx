import { enableScreens } from 'react-native-screens';
enableScreens();

import { useEffect, useState, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { LoadingProvider } from '@/context/LoadingContext';
import { MenuModalProvider } from '@/context/MenuModalContext';
import { TransactionTypeModalProvider } from '@/context/TransactionTypeModalContext';
import { Loading } from '@/components/Loading';
import { CustomSplashScreen } from '@/components';
import { useLoading } from '@/context/LoadingContext';
import AppRoutes from './AppRoutes';
import DebugPanel from '@/components/DebugPanel';

import Toast from 'react-native-toast-message';

// Controle global do splash
let splashAlreadyShown = false;

function AppContent() {
  return <AppRoutes />;
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(!splashAlreadyShown);
  useFrameworkReady();

  const handleSplashFinish = () => {
    setShowSplash(false);
    splashAlreadyShown = true;
  };

  if (showSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LoadingProvider>
          <AuthProvider>
            <DataProvider>
              <MenuModalProvider>
                <TransactionTypeModalProvider>
                  <AppContent />
                  <DebugPanel />
                  <Toast />
                </TransactionTypeModalProvider>
              </MenuModalProvider>
            </DataProvider>
          </AuthProvider>
        </LoadingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}