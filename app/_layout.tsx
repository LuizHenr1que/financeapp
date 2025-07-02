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

function AppContent() {
  const { isLoading } = useLoading();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <Loading visible={isLoading} />
    </>
  );
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