import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUpRight, ArrowDownLeft, Play, Car, DollarSign, ShoppingCart, Home, Coffee, Zap } from 'lucide-react-native';
import { theme } from '@/theme';
import { useData } from '@/context/DataContext';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';

const screenWidth = Dimensions.get('window').width;

type PeriodType = 'Day' | 'Month' | 'Weekly';

export default function ReportsScreen() {
  const { data } = useData();
  const { navigateBack } = useNavigationWithLoading();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('Month');

  const handleViewPress = () => {
    console.log('Visualização pressionada');
  };

  const handleFilterPress = () => {
    console.log('Filtro pressionado');
  };

  const handleSearchPress = () => {
    console.log('Busca pressionada');
  };

  // Dados simulados para o gráfico
  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(77, 208, 167, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(77, 208, 167, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4DD0A7',
      fill: '#4DD0A7',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#E5E5E5',
      strokeWidth: 1,
    },
  };

  // Transações recentes simuladas
  const recentTransactions = [
    {
      id: '1',
      type: 'expense' as const,
      title: 'Corrida UBER',
      subtitle: '22 Abr, 22:50',
      amount: -574.00,
      icon: Car,
      iconColor: '#FF6B6B',
    },
    {
      id: '2',
      type: 'income' as const,
      title: 'Dinheiro Recebido',
      subtitle: '21 Abr, 14:30',
      amount: 2047.00,
      icon: DollarSign,
      iconColor: '#4DD0A7',
    },
    {
      id: '3',
      type: 'expense' as const,
      title: 'Supermercado',
      subtitle: '20 Abr, 16:15',
      amount: -287.50,
      icon: ShoppingCart,
      iconColor: '#FF9F43',
    },
    {
      id: '4',
      type: 'expense' as const,
      title: 'Aluguel',
      subtitle: '18 Abr, 09:00',
      amount: -1200.00,
      icon: Home,
      iconColor: '#5F27CD',
    },
    {
      id: '5',
      type: 'expense' as const,
      title: 'Cafeteria',
      subtitle: '17 Abr, 08:30',
      amount: -25.90,
      icon: Coffee,
      iconColor: '#8D4004',
    },
    {
      id: '6',
      type: 'expense' as const,
      title: 'Conta de Luz',
      subtitle: '15 Abr, 12:00',
      amount: -189.00,
      icon: Zap,
      iconColor: '#F39C12',
    },
  ];

  const periods: PeriodType[] = ['Day', 'Month', 'Weekly'];
  
  const periodLabels: Record<PeriodType, string> = {
    'Day': 'Dia',
    'Month': 'Mês', 
    'Weekly': 'Semana'
  };

  return (
    <View style={styles.container}>
      <Header 
        type="reports"
        onViewPress={handleViewPress}
        onFilterPress={handleFilterPress}
        onSearchPress={handleSearchPress}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <LinearGradient
          colors={['#006B5B', '#00A085', '#4DD0A7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <Text style={styles.balanceAmount}>R$ 3.567,12</Text>
          
          {/* Period Selector */}
          <View style={styles.periodContainer}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodText,
                    selectedPeriod === period && styles.periodTextActive,
                  ]}
                >
                  {periodLabels[period]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Chart Card */}
        <Card style={styles.chartCard}>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withHorizontalLabels={true}
            withVerticalLabels={false}
            withDots={true}
            withShadow={false}
            withScrollableDot={false}
          />
        </Card>

        {/* Transactions History */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Histórico de Transações</Text>
          
          {recentTransactions.map((transaction) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionContent}>
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionIcon}>
                    <transaction.icon size={20} color={transaction.iconColor} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionSubtitle}>{transaction.subtitle}</Text>
                  </View>
                </View>
                
                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color: transaction.type === 'income' 
                          ? theme.colors.income 
                          : theme.colors.expense
                      }
                    ]}
                  >
                    {transaction.type === 'income' ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2).replace('.', ',')}
                  </Text>
                  {transaction.type === 'income' ? (
                    <ArrowDownLeft size={16} color={theme.colors.income} />
                  ) : (
                    <ArrowUpRight size={16} color={theme.colors.expense} />
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab}>
          <Play size={24} color="white" fill="white" />
        </TouchableOpacity>
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
    padding: theme.spacing.md,
  },
  balanceCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.large,
    // Sombra para dar profundidade
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  balanceLabel: {
    fontSize: theme.typography.small,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.xs,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.title,
    marginBottom: theme.spacing.lg,
  },
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  periodText: {
    fontSize: theme.typography.small,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  periodTextActive: {
    color: theme.colors.primary,
  },
  chartCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: 16,
  },
  transactionsSection: {
    marginBottom: 100, // Espaço para o FAB
  },
  sectionTitle: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  transactionCard: {
    marginBottom: theme.spacing.sm,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  transactionAmount: {
    fontSize: theme.typography.medium,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
