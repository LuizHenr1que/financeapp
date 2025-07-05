import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Loading } from '@/components/Loading';
import { useLoading } from '@/context/LoadingContext';
import { useAuth } from '@/context/AuthContext';

export default function AppRoutes() {
  const { isLoading } = useLoading();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return <Loading visible={true} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <Loading visible={isLoading} />
    </>
  );
}
