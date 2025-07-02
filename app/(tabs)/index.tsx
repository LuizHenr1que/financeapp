import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, TrendingUp, TrendingDown, DollarSign, CircleAlert as AlertCircle, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useMenuModal } from '@/context/MenuModalContext';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { logout } = useAuth();
  const { data, getTotalBalance, getMonthlyIncome, getMonthlyExpenses, getCategoryExpenses } = useData();
  const { openModal } = useMenuModal();
  const router = useRouter();

  const totalBalance = getTotalBalance();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const categoryExpenses = getCategoryExpenses();

  const chartData = categoryExpenses.length > 0 ? categoryExpenses.map(item => ({
    name: item.name,
    population: item.amount,
    color: item.color,
    legendFontColor: theme.colors.text,
    legendFontSize: 12,
  })) : [{
    name: 'Sem gastos',
    population: 1,
    color: theme.colors.border,
    legendFontColor: theme.colors.textSecondary,
    legendFontSize: 12,
  }];

  const nearGoals = data.goals.filter(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    return progress >= 80;
  });

  const handleNotificationPress = () => {
    // Lógica para notificações
    console.log('Notificação pressionada');
  };

  const handleMenuPress = () => {
    openModal();
  };

  const handleHelpPress = () => {
    console.log('Ajuda pressionada');
  };

  const handleUserPress = () => {
    router.push('/profile');
  };

  return (
    <>
      <View style={styles.container}>
        <Header 
          type="dashboard"
          userName="Luiz Henrique"
          onMenuPress={handleMenuPress}
          onNotificationPress={handleNotificationPress}
          onHelpPress={handleHelpPress}
          onUserPress={handleUserPress}
        />


        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filtragem  */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterMonth} activeOpacity={0.7}>
            <Text style={styles.filterMonthText}>{`julho 2025`}</Text>
            <ChevronDown size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterExpand} activeOpacity={0.7}>
            <Text style={styles.filterExpandText}>Expandir</Text>
            <ChevronDown size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        {/* Balance Card */}
        <LinearGradient
          colors={['#006B5B', '#00A085', '#4DD0A7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={styles.balanceAmount}>
            R$ {totalBalance.toFixed(2).replace('.', ',')}
          </Text>
        </LinearGradient>


        {/* Income and Expenses (linha 1) */}
        <View style={styles.incomeExpenseRow}>
          <Card style={[styles.incomeExpenseCard, styles.incomeCard]}>
            <View style={styles.incomeExpenseHeader}>
              <TrendingUp size={20} color={theme.colors.income} />
              <Text style={styles.incomeExpenseTitle}>Receitas</Text>
            </View>
            <Text style={styles.incomeAmount}>R$ {monthlyIncome.toFixed(2)}</Text>
            <Text style={styles.periodText}>Este mês</Text>
          </Card>

          <Card style={[styles.incomeExpenseCard, styles.expenseCard]}>
            <View style={styles.incomeExpenseHeader}>
              <TrendingDown size={20} color={theme.colors.expense} />
              <Text style={styles.incomeExpenseTitle}>Despesas</Text>
            </View>
            <Text style={styles.expenseAmount}>R$ {monthlyExpenses.toFixed(2)}</Text>
            <Text style={styles.periodText}>Este mês</Text>
          </Card>
        </View>
        {/* Recebido e Pago (linha 2) */}
        <View style={styles.incomeExpenseRow}>
          <Card style={[styles.incomeExpenseCard, styles.incomeCard]}>
            <View style={styles.incomeExpenseHeader}>
              <TrendingUp size={20} color={theme.colors.income} />
              <Text style={styles.incomeExpenseTitle}>Recebido</Text>
            </View>
            <Text style={styles.incomeAmount}>R$ {monthlyIncome.toFixed(2)}</Text>
            <Text style={styles.periodText}>Este mês</Text>
          </Card>

          <Card style={[styles.incomeExpenseCard, styles.expenseCard]}>
            <View style={styles.incomeExpenseHeader}>
              <TrendingDown size={20} color={theme.colors.expense} />
              <Text style={styles.incomeExpenseTitle}>Pago</Text>
            </View>
            <Text style={styles.expenseAmount}>R$ {monthlyExpenses.toFixed(2)}</Text>
            <Text style={styles.periodText}>Este mês</Text>
          </Card>
        </View>

        {/* Cards Overview */}
        {data.cards.length > 0 && (
          <Card style={styles.cardsCard}>
            <Text style={styles.sectionTitle}>Cartões</Text>
            {data.cards.map(card => {
              const utilization = (card.currentSpending / card.limit) * 100;
              return (
                <View key={card.id} style={styles.cardItem}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{card.name}</Text>
                    <Text style={styles.cardUtilization}>{utilization.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.cardProgress}>
                    <View style={styles.cardProgressTrack}>
                      <View 
                        style={[
                          styles.cardProgressFill, 
                          { 
                            width: `${Math.min(utilization, 100)}%`,
                            backgroundColor: utilization > 80 ? theme.colors.error : theme.colors.primary
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  <Text style={styles.cardAmount}>
                    R$ {card.currentSpending.toFixed(2)} / R$ {card.limit.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}

        {/* Category Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
          {categoryExpenses.length > 0 ? (
            <PieChart
              data={chartData}
              width={screenWidth - 64}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(29, 233, 182, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.emptyChart}>
              <DollarSign size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyChartText}>Nenhuma despesa este mês</Text>
            </View>
          )}
        </Card>

        {/* Goals Alert */}
        {nearGoals.length > 0 && (
          <Card style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <AlertCircle size={20} color={theme.colors.warning} />
              <Text style={styles.alertTitle}>Metas Próximas!</Text>
            </View>
            {nearGoals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <Text key={goal.id} style={styles.alertText}>
                  {goal.name} está {progress.toFixed(0)}% concluída!
                </Text>
              );
            })}
          </Card>
        )}
      </ScrollView>
      </View>
    </>
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  filterMonth: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterMonthText: {
    fontSize: theme.typography.medium,
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  filterMonthIcon: {
    fontSize: theme.typography.medium,
    color: theme.colors.text,
  },
  filterExpand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterExpandText: {
    fontSize: theme.typography.medium,
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  filterExpandIcon: {
    fontSize: theme.typography.medium,
    color: theme.colors.text,
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
    fontSize: theme.typography.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.xs,
  },
  balanceAmount: {
    fontSize: theme.typography.titleLarge,
    fontWeight: 'bold',
    color: theme.colors.title,
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  incomeExpenseCard: {
    flex: 1,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.income,
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.expense,
  },
  incomeExpenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  incomeExpenseTitle: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  incomeAmount: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.income,
  },
  expenseAmount: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.expense,
  },
  periodText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  cardsCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  cardItem: {
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardName: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cardUtilization: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  cardProgress: {
    marginBottom: theme.spacing.xs,
  },
  cardProgressTrack: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
  },
  cardProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardAmount: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
  chartCard: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyChartText: {
    fontSize: theme.typography.medium,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  alertCard: {
    backgroundColor: '#fff3cd',
    borderColor: theme.colors.warning,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  alertTitle: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
  },
  alertText: {
    fontSize: theme.typography.regular,
    color: '#856404',
  },
});