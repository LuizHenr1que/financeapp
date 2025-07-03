import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Loading } from '@/components/Loading';
import { useLoading } from '@/context/LoadingContext';

export default function AppRoutes() {
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
