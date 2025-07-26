import React, { useState, useRef } from 'react';
import { Animated, Easing } from 'react-native';
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
  const { logout, user } = useAuth();
  const { data, getTotalBalance, getMonthlyIncome, getMonthlyExpenses, getCategoryExpenses } = useData();
  const { openModal } = useMenuModal();
  const router = useRouter();

  // Debug: vamos ver se o usuário está sendo carregado
  console.log('👤 Dashboard - Usuário atual:', user);
  console.log('📧 Dashboard - Email do usuário:', user?.email);
  console.log('📛 Dashboard - Nome do usuário:', user?.name);

  const totalBalance = Number(getTotalBalance()) || 0;
  const monthlyIncome = Number(getMonthlyIncome()) || 0;
  const monthlyExpenses = Number(getMonthlyExpenses()) || 0;
  const categoryExpenses = getCategoryExpenses() || [];

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

  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [expandExtraCards, setExpandExtraCards] = useState(false);
  const [currentMonth, setCurrentMonth] = useState({
    month: 6, // julho (0-based)
    year: 2025,
  });
  const monthFilterAnim = useRef(new Animated.Value(0)).current;
  const extraCardsAnim = useRef(new Animated.Value(0)).current;

  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  function getMonthLabel(offset = 0) {
    let m = currentMonth.month + offset;
    let y = currentMonth.year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    return `${months[m]} ${y}`;
  }

  function goToPrevMonth() {
    setCurrentMonth(prev => {
      let m = prev.month - 1;
      let y = prev.year;
      if (m < 0) { m = 11; y -= 1; }
      return { month: m, year: y };
    });
  }
  function goToNextMonth() {
    setCurrentMonth(prev => {
      let m = prev.month + 1;
      let y = prev.year;
      if (m > 11) { m = 0; y += 1; }
      return { month: m, year: y };
    });
  }

  function handleMonthFilterToggle() {
    if (!showMonthFilter) {
      setShowMonthFilter(true);
      Animated.timing(monthFilterAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();
    } else {
      Animated.timing(monthFilterAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
        easing: Easing.in(Easing.ease),
      }).start(() => setShowMonthFilter(false));
    }
  }

  function handleExpandToggle() {
    if (!expandExtraCards) {
      setExpandExtraCards(true);
      Animated.timing(extraCardsAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();
    } else {
      Animated.timing(extraCardsAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
        easing: Easing.in(Easing.ease),
      }).start(() => setExpandExtraCards(false));
    }
  }

  return (
    <>
      <View style={styles.container}>
        <Header 
          type="dashboard"
          userName={user?.name || "Usuário"}
          onMenuPress={handleMenuPress}
          onNotificationPress={handleNotificationPress}
          onHelpPress={handleHelpPress}
          onUserPress={handleUserPress}
        />


        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filtragem  */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterMonth} activeOpacity={0.7} onPress={handleMonthFilterToggle}>
            <Text style={styles.filterMonthText}>{getMonthLabel()}</Text>
            <ChevronDown size={18} color={theme.colors.text} style={{ transform: [{ rotate: showMonthFilter ? '180deg' : '0deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterExpand} activeOpacity={0.7} onPress={handleExpandToggle}>
            <Text style={styles.filterExpandText}>Expandir</Text>
            <ChevronDown size={18} color={theme.colors.text} style={{ transform: [{ rotate: expandExtraCards ? '180deg' : '0deg' }] }} />
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
{/* linha para filtro com mes ( button arrow right  maio 2025  (mes atual) julho 2025 arrow left  */}
        <Animated.View style={{
          overflow: 'hidden',
          height: monthFilterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 80] }),
          opacity: monthFilterAnim,
          marginBottom: showMonthFilter ? styles.monthFilterBox.marginBottom : 0,
        }}>
          {showMonthFilter && (
            <View style={styles.monthFilterBox}>
              <TouchableOpacity style={styles.arrowButton} onPress={goToPrevMonth}>
                <ChevronDown size={20} color={theme.colors.text} style={{ transform: [{ rotate: '90deg' }] }} />
              </TouchableOpacity>
              {/* Mês anterior */}
              <View style={styles.monthCol}>
                <Text style={styles.monthColMonth}>{months[(currentMonth.month - 1 + 12) % 12]}</Text>
                <Text style={styles.monthColYear}>{(currentMonth.month - 1) < 0 ? currentMonth.year - 1 : currentMonth.year}</Text>
              </View>
              {/* Mês atual */}
              <View style={[styles.monthCol, styles.monthColCurrent]}>
                <Text style={[styles.monthColMonth, styles.monthColMonthCurrent]}>{months[currentMonth.month]}</Text>
                <Text style={[styles.monthColYear, styles.monthColYearCurrent]}>{currentMonth.year}</Text>
              </View>
              {/* Mês seguinte */}
              <View style={styles.monthCol}>
                <Text style={styles.monthColMonth}>{months[(currentMonth.month + 1) % 12]}</Text>
                <Text style={styles.monthColYear}>{(currentMonth.month + 1) > 11 ? currentMonth.year + 1 : currentMonth.year}</Text>
              </View>
              <TouchableOpacity style={styles.arrowButton} onPress={goToNextMonth}>
                <ChevronDown size={20} color={theme.colors.text} style={{ transform: [{ rotate: '-90deg' }] }} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
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
        {/* Extra cards ao expandir */}
        <Animated.View style={{
          overflow: 'hidden',
          height: extraCardsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 2 * 120] }), // 2 linhas de cards, 120px cada
          opacity: extraCardsAnim,
        }}>
          {expandExtraCards && (
            <>
              <View style={styles.incomeExpenseRow}>
                <Card style={[styles.incomeExpenseCard, styles.incomeCard]}>
                  <View style={styles.incomeExpenseHeader}>
                    <TrendingUp size={20} color={theme.colors.income} />
                    <Text style={styles.incomeExpenseTitle}>Para Receber</Text>
                  </View>
                  <Text style={styles.incomeAmount}>R$ 0,00</Text>
                  <Text style={styles.periodText}>Este mês</Text>
                </Card>
                <Card style={[styles.incomeExpenseCard, styles.expenseCard]}>
                  <View style={styles.incomeExpenseHeader}>
                    <TrendingDown size={20} color={theme.colors.expense} />
                    <Text style={styles.incomeExpenseTitle}>Para Pagar</Text>
                  </View>
                  <Text style={styles.expenseAmount}>R$ 0,00</Text>
                  <Text style={styles.periodText}>Este mês</Text>
                </Card>
              </View>
              <View style={styles.incomeExpenseRow}>
                <Card style={[styles.incomeExpenseCard, styles.incomeCard]}>
                  <View style={styles.incomeExpenseHeader}>
                    <TrendingUp size={20} color={theme.colors.income} />
                    <Text style={styles.incomeExpenseTitle}>Saldo Projetado</Text>
                  </View>
                  <Text style={styles.incomeAmount}>R$ 0,00</Text>
                  <Text style={styles.periodText}>Este mês</Text>
                </Card>
                <Card style={[styles.incomeExpenseCard, styles.expenseCard]}>
                  <View style={styles.incomeExpenseHeader}>
                    <TrendingDown size={20} color={theme.colors.expense} />
                    <Text style={styles.incomeExpenseTitle}>Balanço</Text>
                  </View>
                  <Text style={styles.expenseAmount}>R$ 0,00</Text>
                  <Text style={styles.periodText}>Este mês</Text>
                </Card>
              </View>
            </>
          )}
        </Animated.View>

        {/* Cards Overview */}
        {data.cards.length > 0 && (
          <Card style={styles.cardsCard}>
            <Text style={styles.sectionTitle}>
              <Text style={styles.sectionTitleThin}>Meus </Text>
              <Text style={styles.sectionTitleBold}>Cartões</Text>
            </Text>
            {data.cards.map(card => {
              const despesasCartao = data.transactions?.filter(t => t.type === 'expense' && t.cardId === card.id) || [];
              const cardLimit = Number(card.limit) || 0;
              const cardSpending = despesasCartao.reduce((sum, t) => sum + Number(t.amount), 0);
              const utilization = cardLimit > 0 ? (cardSpending / cardLimit) * 100 : 0;
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
                    R$ {cardSpending.toFixed(2)} / R$ {cardLimit.toFixed(2)}
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
              const progress = (Number(goal.currentAmount) || 0) / (Number(goal.targetAmount) || 1) * 100;
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
  sectionTitleThin: {
    fontWeight: '400',
    color: theme.colors.text,
  },
  sectionTitleBold: {
    fontWeight: 'bold',
    color: theme.colors.text,
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
  monthFilterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  arrowButton: {
    padding: theme.spacing.xs,
  },
  monthText: {
    fontSize: theme.typography.medium,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.xs,
  },
  monthCol: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  monthColMonth: {
    fontSize: theme.typography.medium,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  monthColYear: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    opacity: 0.7,
    marginTop: -2,
  },
  monthColCurrent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  monthColMonthCurrent: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  monthColYearCurrent: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
});