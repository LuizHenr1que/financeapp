import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { X, Home, Grid3x3, CreditCard, Receipt, Target, BarChart3, User, Settings, Users, Eye, FileText, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/theme';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function SideMenu({ visible, onClose }: SideMenuProps) {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const menuItems = [
    { 
      icon: BarChart3, 
      title: 'Minhas Estatísticas', 
      route: '/reports' 
    },
    { 
      icon: Users, 
      title: 'Convidar Amigos', 
      route: '/invite' 
    },
    { 
      icon: Settings, 
      title: 'Configurações', 
      route: '/settings' 
    },
    { 
      icon: Eye, 
      title: 'Descobrir', 
      route: '/discover' 
    },
    { 
      icon: FileText, 
      title: 'Relatório', 
      route: '/reports' 
    },
    { 
      icon: Bell, 
      title: 'Lembrete', 
      route: '/reminder' 
    },
  ];

  const navigationItems = [
    { 
      icon: Home, 
      title: 'Painel', 
      route: '/' 
    },
    { 
      icon: Grid3x3, 
      title: 'Categorias', 
      route: '/categories' 
    },
    { 
      icon: CreditCard, 
      title: 'Cartões', 
      route: '/cards' 
    },
    { 
      icon: Receipt, 
      title: 'Transações', 
      route: '/transactions' 
    },
    { 
      icon: Target, 
      title: 'Metas', 
      route: '/goals' 
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.menuContainer}>
          <View style={styles.handle} />
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <User size={24} color={theme.colors.title} />
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>Luiz Henrique</Text>
                  <Text style={styles.userEmail}>luiz@gmail.com</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={theme.colors.title} />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => handleNavigation(item.route)}
                  >
                    <IconComponent size={20} color={theme.colors.text} />
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </TouchableOpacity>
                );
              })}

              {/* Separator */}
              <View style={styles.separator} />

              {/* Navigation Items */}
              <Text style={styles.sectionTitle}>Navegação</Text>
              {navigationItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => handleNavigation(item.route)}
                  >
                    <IconComponent size={20} color={theme.colors.text} />
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    minHeight: '60%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    position: 'relative',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.medium,
    fontWeight: 'bold',
    color: theme.colors.title,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: theme.typography.small,
    color: theme.colors.title,
    opacity: 0.8,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  menuItems: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  menuItemText: {
    fontSize: theme.typography.medium,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.small,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
});
