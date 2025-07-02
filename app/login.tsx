import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError('');

    const success = await login(username, password);
    
    if (success) {
      router.replace('/(tabs)');
    } else {
      setError('Dados incorretos');
    }
    
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Finanças</Text>
          <Text style={styles.subtitle}>Controle suas finanças</Text>
        </View>

        <Card style={styles.loginCard}>
          <Input
            label="Usuário"
            value={username}
            onChangeText={setUsername}
            placeholder="Digite seu usuário"
            autoCapitalize="none"
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            secureTextEntry
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title={isLoading ? "Entrando..." : "Entrar"}
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.demoInfo}>
            <Text style={styles.demoText}>Dados para teste:</Text>
            <Text style={styles.demoCredentials}>Usuário: luiz</Text>
            <Text style={styles.demoCredentials}>Senha: 12345</Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.typography.titleLarge,
    fontWeight: 'bold',
    color: theme.colors.title,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.medium,
    color: theme.colors.title,
    opacity: 0.9,
  },
  loginCard: {
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.small,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  demoInfo: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary,
  },
  demoText: {
    fontSize: theme.typography.small,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  demoCredentials: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
});