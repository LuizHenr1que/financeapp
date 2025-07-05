import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import LogoIcon from '@/assets/images/logoicon.svg';
import { theme } from '@/theme';

// Manter a splash screen visível
SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

interface CustomSplashScreenProps {
  onFinish: () => void;
}

export default function CustomSplashScreen({ onFinish }: CustomSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const whiteBackgroundAnim = useRef(new Animated.Value(0)).current;
  
  // Animações das letras
  const inLetterAnim = useRef(new Animated.Value(0)).current;
  const financeLetterAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    // Sequência de animações
    Animated.sequence([
      // 1. Fade in geral
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // 2. Animar parte branca subindo
      Animated.timing(whiteBackgroundAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
      
      // 3. Animar as letras "In" aparecendo
      Animated.spring(inLetterAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      
      // 4. Animar as letras "Finance" aparecendo
      Animated.spring(financeLetterAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      
      // 5. Animar logo aparecendo
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Finalizar após 4 segundos
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        SplashScreen.hideAsync();
        onFinish();
      });
    }, 4000);
  };

  // Interpolação para a altura da parte branca
  const whiteBackgroundHeight = whiteBackgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.6], // Sobe até 60% da tela
  });

  // Animação de loading nas letras "In"
  const inScale = inLetterAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.1, 1],
  });

  // Animação de loading nas letras "Finance"
  const financeScale = financeLetterAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.1, 1],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, '#14532d']}
        style={styles.gradient}
      >
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          {/* Fundo branco que sobe */}
          <Animated.View 
            style={[
              styles.whiteBackground, 
              { height: whiteBackgroundHeight }
            ]} 
          />
          
          {/* Conteúdo principal */}
          <View style={styles.content}>
            {/* Header com texto */}
            <View style={styles.header}>
              <View style={styles.textContainer}>
                {/* Texto "In" verde com animação */}
                <Animated.View
                  style={{
                    transform: [{ scale: inScale }],
                    opacity: inLetterAnim,
                  }}
                >
                  <Text style={[styles.logoBrand, styles.logoIn]}>In</Text>
                </Animated.View>
                
                {/* Texto "Finance" branco com animação */}
                <Animated.View
                  style={{
                    transform: [{ scale: financeScale }],
                    opacity: financeLetterAnim,
                  }}
                >
                  <Text style={[styles.logoBrand, styles.logoFinance]}>Finance</Text>
                </Animated.View>
              </View>

              {/* Logo SVG abaixo do texto */}
              <Animated.View
                style={{
                  transform: [{ scale: logoScaleAnim }],
                  opacity: logoScaleAnim,
                }}
              >
                <LogoIcon width={180} height={180} style={styles.logo} />
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  whiteBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 600,
    borderTopRightRadius: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    marginTop: -200,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 32,
  },
  logoBrand: {
    fontSize: 52,
    fontFamily: 'Inter-Black',
    letterSpacing: -1,
  },
  logoIn: {
    color: theme.colors.secondary, // Verde
  },
  logoFinance: {
    color: theme.colors.title, // Branco/Preto dependendo do tema
  },
  logo: {
    marginTop: 16,
  },
});
