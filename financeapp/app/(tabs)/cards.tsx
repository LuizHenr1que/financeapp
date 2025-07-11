import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Plus, Edit3, Trash2, CreditCard } from 'lucide-react-native';
import { theme } from '@/theme';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Header } from '@/components/Header';
import { Card as CardType } from '@/types';
import { AddCardMethodModal } from '@/components/AddCardMethodModal';
import { Modalize } from 'react-native-modalize';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Tipagem customizada para o ref do modal
interface AddCardMethodModalRef {
  open: () => void;
  close: () => void;
  openManual?: () => void;
}

export default function CardsScreen() {
  const { data, addCard, updateCard, deleteCard } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    limit: '',
    closingDay: '',
    dueDay: '',
    color: '#1de9b6',
  });
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const addCardModalRef = useRef<AddCardMethodModalRef>(null);
  const params = useLocalSearchParams();
  const router = useRouter();

  const colors = [
    '#1de9b6', '#0f2e2a', '#ff6b6b', '#4ecdc4', 
    '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  ];

  React.useEffect(() => {
    if (params.selectedAccount && addCardModalRef.current) {
      if (addCardModalRef.current.openManual) {
        addCardModalRef.current.openManual();
      } else {
        addCardModalRef.current.open();
      }
      // Limpa o parâmetro selectedAccount da URL após o uso
      const { selectedAccount, ...rest } = params;
      router.replace({ pathname: '/cards', params: rest });
    }
  }, [params.selectedAccount]);

  const handleViewPress = () => {
    console.log('Visualização pressionada');
  };

  const handleFilterPress = () => {
    console.log('Filtro pressionado');
  };

  const handleSearchPress = () => {
    console.log('Busca pressionada');
  };

  const handleEdit = (card: CardType) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      limit: card.limit.toString(),
      closingDay: card.closingDay.toString(),
      dueDay: card.dueDay.toString(),
      color: card.color,
    });
    setIsEditing(true);
  };

  const handleDelete = (cardId: string) => {
    Alert.alert(
      'Excluir Cartão',
      'Tem certeza que deseja excluir este cartão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteCard(cardId),
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.limit || !formData.closingDay || !formData.dueDay) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const limit = parseFloat(formData.limit);
    const closingDay = parseInt(formData.closingDay);
    const dueDay = parseInt(formData.dueDay);

    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Erro', 'Limite deve ser um valor válido');
      return;
    }

    if (isNaN(closingDay) || closingDay < 1 || closingDay > 31) {
      Alert.alert('Erro', 'Dia do fechamento deve ser entre 1 e 31');
      return;
    }

    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      Alert.alert('Erro', 'Dia do vencimento deve ser entre 1 e 31');
      return;
    }

    try {
      const cardData = {
        name: formData.name,
        limit,
        closingDay,
        dueDay,
        color: formData.color,
        currentSpending: editingCard?.currentSpending || 0,
      };

      if (editingCard) {
        await updateCard(editingCard.id, cardData);
      } else {
        await addCard(cardData);
      }
      resetForm();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o cartão');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      limit: '',
      closingDay: '',
      dueDay: '',
      color: '#1de9b6',
    });
    setEditingCard(null);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.editHeader}>
          <Text style={styles.editTitle}>
            {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
          </Text>
          <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Card>
            <Input
              label="Nome do Cartão"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Cartão Principal"
            />

            <Input
              label="Limite (R$)"
              value={formData.limit}
              onChangeText={(text) => setFormData({ ...formData, limit: text })}
              placeholder="0,00"
              keyboardType="numeric"
            />

            <Input
              label="Dia do Fechamento"
              value={formData.closingDay}
              onChangeText={(text) => setFormData({ ...formData, closingDay: text })}
              placeholder="15"
              keyboardType="numeric"
            />

            <Input
              label="Dia do Vencimento"
              value={formData.dueDay}
              onChangeText={(text) => setFormData({ ...formData, dueDay: text })}
              placeholder="10"
              keyboardType="numeric"
            />

            <Text style={styles.sectionTitle}>Cor do Cartão</Text>
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
        type="cards"
        onViewPress={handleViewPress}
        onFilterPress={handleFilterPress}
        onSearchPress={handleSearchPress}
      />

      <ScrollView style={styles.content}>
        {/* Add Card Button */}
        <Card style={styles.addButtonCard}>
          <TouchableOpacity
            onPress={() => addCardModalRef.current?.open()}
            style={styles.addCardButton}
          >
            <Plus size={24} color={theme.colors.primary} />
            <Text style={styles.addCardText}>Adicionar Novo Cartão</Text>
          </TouchableOpacity>
        </Card>

        {/* Cards List */}
        {data.cards.length === 0 ? (
          <Card style={styles.emptyCard}>
            <CreditCard size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum cartão cadastrado</Text>
            <Text style={styles.emptyText}>
              Adicione seus cartões de crédito para acompanhar os gastos e
              limites
            </Text>
          </Card>
        ) : (
          data.cards.map((card) => {
            const cardLimit = Number(card.limit) || 0;
            const cardSpending = Number(card.currentSpending) || 0;
            const utilization = cardLimit > 0 ? (cardSpending / cardLimit) * 100 : 0;
            const available = cardLimit - cardSpending;

            return (
              <Card key={card.id} style={styles.cardItem}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <View
                      style={[
                        styles.cardColorBadge,
                        { backgroundColor: card.color },
                      ]}
                    />
                    <Text style={styles.cardName}>{card.name}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => handleEdit(card)}
                      style={styles.actionButton}
                    >
                      <Edit3 size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(card.id)}
                      style={styles.actionButton}
                    >
                      <Trash2 size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.amountRow}>
                    <Text style={styles.spentAmount}>
                      R$ {cardSpending.toFixed(2)}
                    </Text>
                    <Text style={styles.limitAmount}>
                      / R$ {cardLimit.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.availableAmount}>
                    Disponível: R$ {available.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(utilization, 100)}%`,
                          backgroundColor:
                            utilization > 80
                              ? theme.colors.error
                              : utilization > 60
                              ? theme.colors.warning
                              : theme.colors.success,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.utilizationText}>
                    {utilization.toFixed(1)}% utilizado
                  </Text>
                </View>

                <View style={styles.datesRow}>
                  <Text style={styles.dateText}>
                    Fechamento: dia {card.closingDay}
                  </Text>
                  <Text style={styles.dateText}>
                    Vencimento: dia {card.dueDay}
                  </Text>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
      {/* Modal de escolha do método de cadastro do cartão */}
      <AddCardMethodModal
        ref={addCardModalRef}
        onManualPress={() => {
          addCardModalRef.current?.close();
          setTimeout(() => setIsEditing(true), 300);
        }}
        onOpenFinancePress={() => {
          addCardModalRef.current?.close();
          // Aqui você pode implementar a lógica do Open Finance futuramente
        }}
      />
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
  addCardButton: {
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
  addCardText: {
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
  cardItem: {
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardColorBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: theme.spacing.md,
  },
  cardName: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  cardDetails: {
    marginBottom: theme.spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.xs,
  },
  spentAmount: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  limitAmount: {
    fontSize: theme.typography.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  availableAmount: {
    fontSize: theme.typography.medium,
    color: theme.colors.success,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  utilizationText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
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
  cardVisualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
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