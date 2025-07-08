import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Phone } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import InputLogin from '@/components/InputLogin';
import { theme } from '@/theme';
import LogoIcon from '@/assets/images/logoicon.svg';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register, isLoading } = useAuth();

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const validatePassword = (value: string) => {
    return {
      length: value.length >= 6,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
    };
  };

  const handleRegister = async () => {
    let hasError = false;
    
    // Validar nome
    if (!name || name.trim().length < 2) {
      setNameError('Nome deve ter pelo menos 2 caracteres');
      hasError = true;
    } else {
      setNameError('');
    }
    
    // Validar email
    if (!email || !validateEmail(email)) {
      setEmailError('Digite um e-mail válido');
      hasError = true;
    } else {
      setEmailError('');
    }
    
    // Validar senha
    const passErrors = validatePassword(password);
    setPasswordErrors(passErrors);
    if (Object.values(passErrors).includes(false)) {
      hasError = true;
    }
    
    // Validar confirmação de senha
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    
    // Validar termos
    if (!acceptTerms) {
      Alert.alert('Atenção', 'Você precisa aceitar os termos e serviços.');
      return;
    }
    
    if (hasError) return;

    try {
      const result = await register(name.trim(), email, password, phone || undefined);
      
      if (result.success) {
        Alert.alert('Sucesso', 'Conta criada com sucesso!', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)')
          }
        ]);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
    }
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
            <LogoIcon width={200} height={200} style={{ marginBottom: 8 }} />
            <Text style={styles.welcomeText}>Bem-vindo ao InFinance</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <InputLogin
                placeholder="Digite seu nome"
                value={name}
                onChangeText={v => { setName(v); setNameError(''); }}
                leftIcon={<User size={20} color="#888" />} // cinza
                autoCapitalize="words"
                autoCorrect={false}
                placeholderTextColor="#888"
              />
              {!!nameError && (
                <Text style={styles.errorText}>{nameError}</Text>
              )}
              <InputLogin
                placeholder="Digite seu email"
                value={email}
                onChangeText={v => { setEmail(v); setEmailError(''); }}
                keyboardType="email-address"
                leftIcon={<Mail size={20} color="#888" />} // cinza
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#888"
              />
              {!!emailError && (
                <Text style={styles.errorText}>{emailError}</Text>
              )}
              <InputLogin
                placeholder="Digite seu telefone (opcional)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon={<Phone size={20} color="#888" />} // cinza
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#888"
              />
              <InputLogin
                placeholder="Digite sua senha"
                value={password}
                onChangeText={v => { setPassword(v); setPasswordErrors(validatePassword(v)); }}
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
                placeholderTextColor="#888"
              />
              <View style={{marginBottom: 8}}>
                <Text style={[styles.requirement, passwordErrors.length ? styles.requirementMet : styles.requirementNotMet]}>• Mínimo de 6 caracteres</Text>
                <Text style={[styles.requirement, passwordErrors.upper ? styles.requirementMet : styles.requirementNotMet]}>• Letra maiúscula</Text>
                <Text style={[styles.requirement, passwordErrors.lower ? styles.requirementMet : styles.requirementNotMet]}>• Letra minúscula</Text>
                <Text style={[styles.requirement, passwordErrors.number ? styles.requirementMet : styles.requirementNotMet]}>• Número</Text>
              </View>
              <InputLogin
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                leftIcon={<Lock size={20} color="#888" />} // cinza
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword((v) => !v)} activeOpacity={0.7}>
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#888" />
                    ) : (
                      <Eye size={20} color="#888" />
                    )}
                  </TouchableOpacity>
                }
                placeholderTextColor="#888"
              />
              <View style={styles.termsContainer}>
                <TouchableOpacity 
                  style={styles.checkbox} 
                  onPress={() => setAcceptTerms(!acceptTerms)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons 
                    name={acceptTerms ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                    size={20} 
                    color={acceptTerms ? '#1db954' : '#888'} 
                  />
                </TouchableOpacity>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    Eu concordo com os
                    <Text style={styles.termsLink} onPress={() => Linking.openURL('https://seusite.com/termos')}> termos e serviços</Text>
                    {' '}e com o
                    <Text style={styles.termsLink} onPress={() => Linking.openURL('https://seusite.com/privacidade')}> aviso de privacidade do InFinance</Text>
                  </Text>
                </View>
              </View>
              <Button
                title={isLoading ? 'Criando...' : 'Concordar e continuar'}
                onPress={handleRegister}
                disabled={isLoading || !acceptTerms}
                style={!acceptTerms && !isLoading ? styles.buttonDisabled : styles.loginButton}
              />
              {/* Link para login */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => router.replace('/') }>
                  <Text style={styles.registerLink}>Entrar</Text>
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
  welcomeText: {
    fontSize: 23, 
    color: theme.colors.text, 
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 0,
    fontFamily: 'Inter-SemiBold', 
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  formContainer: {
    zIndex: 1,
  },
  form: {
    paddingHorizontal: 24,
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#24504c',
  },
  buttonDisabled: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#888',
    opacity: 0.6,
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
    color: '#24504c',
  },
  errorText: {
    color: '#e53935',
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 4,
    fontFamily: 'Inter-Medium',
  },
  requirement: {
    fontSize: 13,
    marginLeft: 4,
    marginBottom: 2,
    fontFamily: 'Inter-Regular',
  },
  requirementMet: {
    color: '#388e3c',
    textDecorationLine: 'none',
  },
  requirementNotMet: {
    color: '#e53935',
    textDecorationLine: 'none',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginLeft: 2,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  termsLink: {
    color: '#1db954',
    fontFamily: 'Inter-SemiBold',
    textDecorationLine: 'underline',
  },
});
