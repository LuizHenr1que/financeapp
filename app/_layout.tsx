import { useEffect } from 'react';
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
import { useLoading } from '@/context/LoadingContext';
import AppRoutes from './AppRoutes';

function AppContent() {
  return <AppRoutes />;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LoadingProvider>
          <AuthProvider>
            <DataProvider>
              <MenuModalProvider>
                <TransactionTypeModalProvider>
                  <AppContent />
                </TransactionTypeModalProvider>
              </MenuModalProvider>
            </DataProvider>
          </AuthProvider>
        </LoadingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}