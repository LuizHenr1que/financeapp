import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { BarChart3, Settings, Home, Grid3x3, CreditCard, Receipt, Target, Wallet, DollarSign } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/theme';

interface MenuModalProps {
  onClose?: () => void;
}

export const MenuModal = forwardRef<Modalize, MenuModalProps>(({ onClose }, ref) => {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.close();
    }
    router.push(route as any);
  };

  const menuItems = [
    { 
      icon: CreditCard, 
      title: 'Cartões',
      subtitle: 'Meus', 
      route: '/cards' 
    },
    { 
      icon: Wallet, 
      title: 'Contas',
      subtitle: 'Minhas', 
      route: '/accounts' 
    },
    { 
      icon: Grid3x3, 
      title: 'Categorias',
      subtitle: 'Minhas', 
      route: '/categories' 
    },
    { 
      icon: BarChart3, 
      title: 'Subcategorias',
      subtitle: 'Minhas', 
      route: '/subcategories' 
    },
    { 
      icon: Target, 
      title: 'Metas',
      subtitle: 'Minhas', 
      route: '/goals' 
    },
    { 
      icon: DollarSign, 
      title: 'Limites',
      subtitle: 'Meus', 
      route: '/limits' 
    },
  ];

  return (
    <Modalize
      ref={ref}
      snapPoint={450}
      modalHeight={550}
      handlePosition="inside"
      handleStyle={styles.handle}
      modalStyle={styles.modal}
      childrenStyle={styles.content}
      onClose={onClose}
      overlayStyle={styles.overlay}
      adjustToContentHeight={false}
      panGestureEnabled={true}
      closeOnOverlayTap={true}
      withOverlay={true}
      modalTopOffset={0}
      rootStyle={styles.modalRoot}
      avoidKeyboardLikeIOS={false}
      keyboardAvoidingBehavior="height"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mais Opções</Text>
        </View>

        {/* Grid de Cards */}
        <View style={styles.gridContainer}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.gridItem}
                onPress={() => handleNavigation(item.route)}
              >
                <View style={styles.cardIcon}>
                  <IconComponent size={24} color={theme.colors.primary} />
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modalize>
  );
});

const styles = StyleSheet.create({
  modal: {
    backgroundColor: theme.colors.surface,
    zIndex: 9999,
    elevation: 9999,
  },
  handle: {
    backgroundColor: theme.colors.border,
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    padding: 0,
  },
  container: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9998,
    elevation: 9998,
  },
  modalRoot: {
    zIndex: 9999,
    elevation: 9999,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  gridItem: {
    width: '33.33%',
    padding: theme.spacing.sm,
  },
  cardIcon: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
  },
  cardSubtitle: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 2,
  },
});
