import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Plus, CreditCard, Target, Receipt, TrendingUp } from 'lucide-react-native';
import { theme } from '@/theme';

export default function AddScreen() {
  const options = [
    {
      title: 'Nova Transação',
      icon: Receipt,
      onPress: () => router.push('/transactions'),
      color: '#10B981',
    },
    {
      title: 'Novo Cartão',
      icon: CreditCard,
      onPress: () => router.push('/cards'),
      color: '#3B82F6',
    },
    {
      title: 'Nova Meta',
      icon: Target,
      onPress: () => router.push('/goals'),
      color: '#8B5CF6',
    },
    {
      title: 'Investimento',
      icon: TrendingUp,
      onPress: () => router.push('/'),
      color: '#F59E0B',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>O que você deseja fazer?</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionButton, { borderLeftColor: option.color }]}
            onPress={option.onPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
              <option.icon size={24} color="white" />
            </View>
            <Text style={styles.optionText}>{option.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 20,
  },
  optionButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
