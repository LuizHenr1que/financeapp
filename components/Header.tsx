import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Menu, HelpCircle, Eye, Filter, Search } from 'lucide-react-native';
import { theme } from '@/theme';

interface HeaderProps {
  type: 'dashboard' | 'transactions' | 'categories' | 'cards' | 'goals' | 'reports';
  userName?: string;
  userPhoto?: string;
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
  onHelpPress?: () => void;
  onViewPress?: () => void;
  onFilterPress?: () => void;
  onSearchPress?: () => void;
  onUserPress?: () => void;
}

export function Header({ 
  type,
  userName = "Usuário",
  userPhoto,
  onNotificationPress,
  onMenuPress,
  onHelpPress,
  onViewPress,
  onFilterPress,
  onSearchPress,
  onUserPress
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  
  const renderDashboardHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      {/* Seção esquerda - Foto e nome do usuário */}
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onUserPress} style={styles.userInfo}>
          {userPhoto ? (
            <Image source={{ uri: userPhoto }} style={styles.userPhoto} />
          ) : (
            <View style={styles.defaultPhoto}>
              <Text style={styles.photoText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.userName}>{userName}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Seção direita - Ícones */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onHelpPress} style={styles.iconButton}>
          <HelpCircle size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
          <Bell size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
          <Menu size={24} color={theme.colors.title} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransactionsHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      {/* Seção esquerda - Título da transação */}
      <View style={styles.leftSection}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>transações</Text>
          <Text style={styles.transactionSubtitle}>Todos os lançamentos</Text>
        </View>
      </View>
      
      {/* Seção direita - Ícones de ação */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onViewPress} style={styles.iconButton}>
          <Eye size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onFilterPress} style={styles.iconButton}>
          <Filter size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
          <Search size={24} color={theme.colors.title} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoriesHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      {/* Seção esquerda - Título da categoria */}
      <View style={styles.leftSection}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>categoria</Text>
          <Text style={styles.transactionSubtitle}>Todas as categorias</Text>
        </View>
      </View>
      
      {/* Seção direita - Ícones de ação */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onViewPress} style={styles.iconButton}>
          <Eye size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onFilterPress} style={styles.iconButton}>
          <Filter size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
          <Search size={24} color={theme.colors.title} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCardsHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      {/* Seção esquerda - Título dos cartões */}
      <View style={styles.leftSection}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>cartões</Text>
          <Text style={styles.transactionSubtitle}>Todos os cartões</Text>
        </View>
      </View>
      
      {/* Seção direita - Ícones de ação */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onViewPress} style={styles.iconButton}>
          <Eye size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onFilterPress} style={styles.iconButton}>
          <Filter size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
          <Search size={24} color={theme.colors.title} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGoalsHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      {/* Seção esquerda - Título das metas */}
      <View style={styles.leftSection}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>metas</Text>
          <Text style={styles.transactionSubtitle}>Todas as metas</Text>
        </View>
      </View>
      
      {/* Seção direita - Ícones de ação */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onViewPress} style={styles.iconButton}>
          <Eye size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onFilterPress} style={styles.iconButton}>
          <Filter size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
          <Search size={24} color={theme.colors.title} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReportsHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      {/* Seção esquerda - Título dos relatórios */}
      <View style={styles.leftSection}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>relatório</Text>
          <Text style={styles.transactionSubtitle}>Detalhado</Text>
        </View>
      </View>
      
      {/* Seção direita - Ícones de ação */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onViewPress} style={styles.iconButton}>
          <Eye size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onFilterPress} style={styles.iconButton}>
          <Filter size={24} color={theme.colors.title} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
          <Search size={24} color={theme.colors.title} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => {
    switch (type) {
      case 'dashboard':
        return renderDashboardHeader();
      case 'transactions':
        return renderTransactionsHeader();
      case 'categories':
        return renderCategoriesHeader();
      case 'cards':
        return renderCardsHeader();
      case 'goals':
        return renderGoalsHeader();
      case 'reports':
        return renderReportsHeader();
      default:
        return renderDashboardHeader();
    }
  };

  return renderHeader();
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilos para Dashboard
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
    // Adiciona feedback visual ao toque
    backgroundColor: 'transparent',
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
  },
  defaultPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.title,
  },
  userName: {
    fontSize: theme.typography.medium,
    fontWeight: '500',
    color: theme.colors.title,
  },
  // Estilos para Transações
  transactionInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  transactionTitle: {
    fontSize: theme.typography.small,
    color: theme.colors.title,
    opacity: 0.8,
    textTransform: 'lowercase',
  },
  transactionSubtitle: {
    fontSize: theme.typography.medium,
    fontWeight: '500',
    color: theme.colors.title,
    marginTop: 2,
  },
});
