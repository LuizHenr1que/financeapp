import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, CreditCard } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/theme';

interface TransactionTypeModalProps {
  onClose?: () => void;
}

export const TransactionTypeModal = forwardRef<Modalize, TransactionTypeModalProps>(({ onClose }, ref) => {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.close();
    }
    setTimeout(() => {
      router.push(route as any);
    }, 200); // delay para animação do modal
  };

  const handleTransactionTypeSelect = (type: 'income' | 'expense') => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.close();
    }
    setTimeout(() => {
      router.push({ pathname: '/addTransaction', params: { type } });
    }, 200);
  };

  const transactionTypes = [
    { 
      icon: ArrowUpCircle, 
      title: 'Receita',
      subtitle: 'Adicionar dinheiro',
      color: theme.colors.success,
      route: '/add?type=income'
    },
    { 
      icon: ArrowDownCircle, 
      title: 'Despesa',
      subtitle: 'Gastar dinheiro',
      color: theme.colors.error,
      route: '/add?type=expense'
    },
    { 
      icon: RefreshCw, 
      title: 'Transferência',
      subtitle: 'Entre contas',
      color: theme.colors.warning,
      route: '/add?type=transfer'
    },
  ];

  return (
    <Modalize
      ref={ref}
      snapPoint={350}
      modalHeight={400}
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

        {/* Lista de Opções */}
        <View style={styles.listContainer}>
          {transactionTypes.map((item, index) => {
            const IconComponent = item.icon;
            const isAddTransaction = item.route.startsWith('/add?type=');
            return (
              <TouchableOpacity
                key={index}
                style={styles.listItem}
                onPress={() =>
                  isAddTransaction
                    ? handleTransactionTypeSelect(item.route.includes('income') ? 'income' : 'expense')
                    : handleNavigation(item.route)
                }
              >
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                  <IconComponent size={24} color={item.color} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
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
    paddingTop: theme.spacing.lg,
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

// Exportação correta para uso com forwardRef
export default TransactionTypeModal;