import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import InputLogin from '@/components/InputLogin';
import { theme } from '@/theme';
import LogoIcon from '@/assets/images/logoicon.svg';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1500);
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google Login',
      'Funcionalidade de login com Google será implementada'
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, '#14532d']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.formBackground} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            
            <Text style={styles.logoBrand}>
              <Text style={styles.logoIn}>In</Text>
              <Text style={styles.logoFinance}>Finance</Text>
            </Text>
            {/* Logo SVG acima do texto */}
            <LogoIcon width={200} height={200} style={{ marginBottom: 8 }} />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <InputLogin
                placeholder="Digite seu email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                leftIcon={<Mail size={20} color="#888" />} // cinza
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#888" // cinza
              />

              <InputLogin
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon={<Lock size={20} color="#888" />} // cinza
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)} activeOpacity={0.7}>
                    {showPassword ? (
                      <EyeOff size={20} color="#888" />
                    ) : (
                      <Eye size={20} color="#888" />
                    )}
                  </TouchableOpacity>
                }
                placeholderTextColor="#888" // cinza
              />

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  Esqueceu sua senha?
                </Text>
              </TouchableOpacity>

              <Button
                title={isLoading ? 'Entrando...' : 'Entrar'}
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.loginButton}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Login */}
              <TouchableOpacity
                onPress={handleGoogleLogin}
                style={styles.googleButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="google"
                  size={20}
                  color="#EA4335"
                  style={styles.googleIcon}
                />
                <Text style={styles.googleText}>Continuar com Google</Text>
                <ArrowRight size={16} color="#24504c" />
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Não tem uma conta? </Text>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Criar conta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  formBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 600,
    borderTopRightRadius: 0,
    paddingTop: 600,
    zIndex: 0,
  },
  header: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  logoBrand: {
    fontSize: 52,
    fontFamily: 'Inter-Black',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
  },
  logoIn: {
    color: theme.colors.secondary,
  },
  logoFinance: {
    color: theme.colors.title,
  },
  tagline: {
    fontSize: 20,
    fontFamily: 'Inter-Black', // ainda mais grosso
    color: '#24504c',
    textAlign: 'left',
    width: 320,
    lineHeight: 26,
    marginTop: 4,
    marginBottom: 0,
    alignSelf: 'center',
  },
  formContainer: {
    zIndex: 1,
  },
  form: {
    paddingHorizontal: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#24504c', // cor padronizada
  },
  loginButton: {
    marginBottom: 24,
    backgroundColor: '#24504c', // cor padronizada
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  googleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  googleText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  registerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#24504c', // cor padronizada
  },
});
