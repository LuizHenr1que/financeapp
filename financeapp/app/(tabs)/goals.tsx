import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Plus, Edit3, Trash2, Target, DollarSign, Calendar } from 'lucide-react-native';
import { theme } from '@/theme';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Header } from '@/components/Header';
import { ProgressBar } from '@/components/ProgressBar';
import { Goal } from '@/types';

export default function GoalsScreen() {
  const { data, addGoal, updateGoal, deleteGoal } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    color: '#1de9b6',
  });

  const colors = [
    '#1de9b6', '#0f2e2a', '#ff6b6b', '#4ecdc4', 
    '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  ];

  const handleViewPress = () => {
    console.log('Visualização pressionada');
  };

  const handleFilterPress = () => {
    console.log('Filtro pressionado');
  };

  const handleSearchPress = () => {
    console.log('Busca pressionada');
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      color: goal.color,
    });
    setIsEditing(true);
  };

  const handleDelete = (goalId: string) => {
    Alert.alert(
      'Excluir Meta',
      'Tem certeza que deseja excluir esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteGoal(goalId),
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.targetAmount || !formData.deadline) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount);
    const currentAmount = parseFloat(formData.currentAmount) || 0;

    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert('Erro', 'Valor da meta deve ser um número válido maior que zero');
      return;
    }

    if (currentAmount < 0) {
      Alert.alert('Erro', 'Valor atual não pode ser negativo');
      return;
    }

    try {
      const goalData = {
        name: formData.name,
        targetAmount,
        currentAmount,
        deadline: formData.deadline,
        color: formData.color,
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
      } else {
        await addGoal(goalData);
      }
      resetForm();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a meta');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      color: '#1de9b6',
    });
    setEditingGoal(null);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const addToGoal = (goalId: string, amount: number) => {
    const goal = data.goals.find(g => g.id === goalId);
    if (goal) {
      const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
      updateGoal(goalId, { currentAmount: newAmount });
    }
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.editHeader}>
          <Text style={styles.editTitle}>
            {editingGoal ? 'Editar Meta' : 'Nova Meta'}
          </Text>
          <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Card>
            <Input
              label="Nome da Meta*"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Viagem de Férias"
            />

            <Input
              label="Valor da Meta (R$)*"
              value={formData.targetAmount}
              onChangeText={(text) => setFormData({ ...formData, targetAmount: text })}
              placeholder="0,00"
              keyboardType="numeric"
            />

            <Input
              label="Valor Atual (R$)"
              value={formData.currentAmount}
              onChangeText={(text) => setFormData({ ...formData, currentAmount: text })}
              placeholder="0,00"
              keyboardType="numeric"
            />

            <Input
              label="Data Limite*"
              value={formData.deadline}
              onChangeText={(text) => setFormData({ ...formData, deadline: text })}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.sectionTitle}>Cor da Meta</Text>
            <View style={styles.colorGrid}>
              {colors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    formData.color === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, color })}
                />
              ))}
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="Cancelar"
                onPress={resetForm}
                variant="outline"
                style={styles.button}
              />
              <Button
                title="Salvar"
                onPress={handleSave}
                style={styles.button}
              />
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        type="goals"
        onViewPress={handleViewPress}
        onFilterPress={handleFilterPress}
        onSearchPress={handleSearchPress}
      />

      <ScrollView style={styles.content}>
        {/* Add Goal Button */}
        <Card style={styles.addButtonCard}>
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={styles.addGoalButton}
          >
            <Plus size={24} color={theme.colors.primary} />
            <Text style={styles.addGoalText}>Adicionar Nova Meta</Text>
          </TouchableOpacity>
        </Card>

        {/* Goals List */}
        {data.goals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Target size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhuma meta cadastrada</Text>
            <Text style={styles.emptyText}>
              Crie suas metas financeiras para acompanhar seu progresso
            </Text>
          </Card>
        ) : (
          data.goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isCompleted = progress >= 100;
            const isOverdue = daysRemaining < 0;
            
            return (
              <Card key={goal.id} style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <View style={[styles.goalColorBadge, { backgroundColor: goal.color }]} />
                    <View style={styles.goalDetails}>
                      <Text style={styles.goalName}>{goal.name}</Text>
                      <View style={styles.goalMeta}>
                        <View style={styles.deadlineContainer}>
                          <Calendar size={14} color={isOverdue ? theme.colors.error : theme.colors.textSecondary} />
                          <Text style={[
                            styles.deadline,
                            { color: isOverdue ? theme.colors.error : theme.colors.textSecondary }
                          ]}>
                            {formatDate(goal.deadline)}
                            {daysRemaining >= 0 ? ` (${daysRemaining} dias)` : ' (Vencida)'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.goalActions}>
                    <TouchableOpacity
                      onPress={() => handleEdit(goal)}
                      style={styles.actionButton}
                    >
                      <Edit3 size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(goal.id)}
                      style={styles.actionButton}
                    >
                      <Trash2 size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.goalProgress}>
                  <View style={styles.amountRow}>
                    <Text style={styles.currentAmount}>
                      R$ {goal.currentAmount.toFixed(2)}
                    </Text>
                    <Text style={styles.targetAmount}>
                      / R$ {goal.targetAmount.toFixed(2)}
                    </Text>
                  </View>
                  
                  <ProgressBar
                    current={goal.currentAmount}
                    target={goal.targetAmount}
                    color={isCompleted ? theme.colors.success : goal.color}
                    showLabel={false}
                    height={12}
                  />

                  <View style={styles.progressInfo}>
                    <Text style={[
                      styles.progressText,
                      { color: isCompleted ? theme.colors.success : theme.colors.text }
                    ]}>
                      {progress.toFixed(1)}% concluído
                    </Text>
                    {!isCompleted && (
                      <Text style={styles.remainingAmount}>
                        Faltam R$ {remaining.toFixed(2)}
                      </Text>
                    )}
                    {isCompleted && (
                      <Text style={styles.completedText}>
                        Meta alcançada! 🎉
                      </Text>
                    )}
                  </View>
                </View>

                {!isCompleted && (
                  <View style={styles.quickActions}>
                    <Text style={styles.quickActionsTitle}>Adicionar à meta:</Text>
                    <View style={styles.quickActionButtons}>
                      {[50, 100, 200, 500].map(amount => (
                        <TouchableOpacity
                          key={amount}
                          style={styles.quickActionButton}
                          onPress={() => addToGoal(goal.id, amount)}
                        >
                          <Text style={styles.quickActionText}>+R$ {amount}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </Card>
            );
          })
        )}
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
  addButtonCard: {
    marginBottom: theme.spacing.lg,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  addGoalText: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  goalItem: {
    marginBottom: theme.spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  goalColorBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  goalDetails: {
    flex: 1,
  },
  goalName: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  goalMeta: {
    marginBottom: theme.spacing.xs,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadline: {
    fontSize: theme.typography.small,
    marginLeft: theme.spacing.xs,
    fontWeight: '600',
  },
  goalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  goalProgress: {
    marginBottom: theme.spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.sm,
  },
  currentAmount: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  targetAmount: {
    fontSize: theme.typography.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  progressText: {
    fontSize: theme.typography.small,
    fontWeight: '600',
  },
  remainingAmount: {
    fontSize: theme.typography.small,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  completedText: {
    fontSize: theme.typography.small,
    color: theme.colors.success,
    fontWeight: '600',
  },
  quickActions: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  quickActionsTitle: {
    fontSize: theme.typography.small,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: theme.typography.small,
    fontWeight: '600',
    color: theme.colors.title,
  },
  sectionTitle: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: theme.colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
  editHeader: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editTitle: {
    fontSize: theme.typography.title,
    fontWeight: 'bold',
    color: theme.colors.title,
  },
  closeButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  closeButtonText: {
    fontSize: theme.typography.medium,
    color: theme.colors.title,
    fontWeight: '500',
  },
});