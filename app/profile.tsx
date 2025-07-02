import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { User, Edit3, Settings, CreditCard, ArrowRight, ArrowLeft, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { Card } from '@/components/Card';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const handleBackPress = () => {
    router.back();
  };

  const handleEditProfile = () => {
    console.log('Editar perfil');
    // router.push('/edit-profile');
  };

  const handleSettings = () => {
    console.log('Configurações');
    // router.push('/settings');
  };

  const handlePlans = () => {
    console.log('Meus planos');
    // router.push('/plans');
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.background} barStyle="dark-content" />

      <ScrollView 
        style={[styles.content, { paddingTop: insets.top + theme.spacing.lg }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={48} color={theme.colors.primary} />
            </View>
          </View>
          
          <Text style={styles.userName}>Luiz Henrique</Text>
          
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Conta ADM</Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <Card style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleEditProfile}
            >
              <View style={styles.menuItemLeft}>
                <Edit3 size={24} color={theme.colors.primary} />
                <Text style={styles.menuItemText}>Editar Perfil</Text>
              </View>
              <ArrowRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleSettings}
            >
              <View style={styles.menuItemLeft}>
                <Settings size={24} color={theme.colors.primary} />
                <Text style={styles.menuItemText}>Configurações</Text>
              </View>
              <ArrowRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handlePlans}
            >
              <View style={styles.menuItemLeft}>
                <CreditCard size={24} color={theme.colors.primary} />
                <Text style={styles.menuItemText}>Meus Planos</Text>
              </View>
              <ArrowRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </Card>

          {/* Logout Section */}
          <Card style={[styles.menuCard, styles.logoutCard]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <View style={styles.menuItemLeft}>
                <LogOut size={24} color={theme.colors.error} />
                <Text style={[styles.menuItemText, styles.logoutText]}>Sair da Conta</Text>
              </View>
              <ArrowRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: theme.spacing.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  avatarContainer: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  userName: {
    fontSize: theme.typography.title,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.large,
  },
  badgeText: {
    fontSize: theme.typography.small,
    fontWeight: 'bold',
    color: theme.colors.title,
    textTransform: 'uppercase',
  },
  menuSection: {
    flex: 1,
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: theme.typography.medium,
    fontWeight: '500',
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  logoutCard: {
    marginTop: theme.spacing.lg,
  },
  logoutText: {
    color: theme.colors.error,
  },
});
