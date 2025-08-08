import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Plus, Edit3, Trash2, CreditCard } from 'lucide-react-native';
import { theme } from '@/theme';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Header } from '@/components/Header';
import { Card as CardType } from '@/types';
import { ICONS, globalImageCache, preloadAccountIcons } from '@/components/AccountIconSelectorModal';
import { AddCardMethodModal } from '@/components/AddCardMethodModal';
import { Modalize } from 'react-native-modalize';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ErrorBoundary from '@/components/ErrorBoundary';

// Tipagem customizada para o ref do modal
interface AddCardMethodModalRef {
  open: () => void;
  close: () => void;
  openManual?: () => void;
}

export default function CardsScreen() {
  const { data, addCard, updateCard, deleteCard } = useData();
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [addCardModalVisible, setAddCardModalVisible] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<CardType | null>(null);
  const removeModalRef = useRef<Modalize>(null);
  const addCardModalRef = useRef<AddCardMethodModalRef>(null);
  const params = useLocalSearchParams();
  const router = useRouter();
  const [selectedAccountForModal, setSelectedAccountForModal] = useState<string | null>(null);

  // Verificação de segurança para garantir que data existe
  if (!data) {
    return (
      <View style={styles.container}>
        <Header 
          type="cards"
          onViewPress={() => {}}
          onFilterPress={() => {}}
          onSearchPress={() => {}}
        />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>Carregando cartões...</Text>
        </View>
      </View>
    );
  }

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
      setSelectedAccountForModal(params.selectedAccount as string);
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
    if (!card || !card.id) {
      console.error('❌ Cartão inválido para edição:', card);
      return;
    }
    console.log('🟡 Editar cartão:', card);
    setEditingCard(card);
    setAddCardModalVisible(true);
    if (addCardModalRef.current && addCardModalRef.current.openManual) {
      addCardModalRef.current.openManual();
    }
  };

  const handleDelete = (card: CardType) => {
    if (!card || !card.id) {
      console.error('❌ Cartão inválido para exclusão:', card);
      return;
    }
    setCardToRemove(card);
    setTimeout(() => removeModalRef.current?.open(), 100);
  };

  const confirmRemove = () => {
    if (cardToRemove && cardToRemove.id) {
      deleteCard(cardToRemove.id);
      removeModalRef.current?.close();
      setTimeout(() => setCardToRemove(null), 300);
    }
  };

  const cancelRemove = () => {
    removeModalRef.current?.close();
    setTimeout(() => setCardToRemove(null), 300);
  };

  // Remover as seguintes linhas:
  // const [isEditing, setIsEditing] = useState(false);
  // const [formData, setFormData] = useState({ ... });
  // const [showAddCardModal, setShowAddCardModal] = useState(false);
  // const handleSave = async () => { ... }
  // const resetForm = () => { ... }
  // if (isEditing) { ... return ... }
  // Garante que o cache de imagens está carregado (executa uma vez)
  React.useEffect(() => {
    preloadAccountIcons();
  }, []);

  // Debug para verificar a estrutura dos dados
  React.useEffect(() => {
    console.log('🔍 Debug - Dados recebidos no cards:', { 
      hasData: !!data,
      cardsLength: data?.cards?.length || 0,
      cards: data?.cards?.map(card => ({
        id: card?.id,
        name: card?.name,
        icon: card?.icon,
        limit: card?.limit,
        closingDay: card?.closingDay,
        dueDay: card?.dueDay
      })),
      transactionsLength: data?.transactions?.length || 0
    });
  }, [data]);

  return (
    <ErrorBoundary>
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
            onPress={() => {
              setEditingCard(null);
              setAddCardModalVisible(true);
              if (addCardModalRef.current && addCardModalRef.current.openManual) {
                addCardModalRef.current.openManual();
              }
            }}
            style={styles.addCardButton}
          >
            <Plus size={24} color={theme.colors.primary} />
            <Text style={styles.addCardText}>Adicionar Novo Cartão</Text>
          </TouchableOpacity>
        </Card>

        {/* Cards List */}
        {!data || !data.cards || data.cards.length === 0 ? (
          <Card style={styles.emptyCard}>
            <CreditCard size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum cartão cadastrado</Text>
            <Text style={styles.emptyText}>
              Adicione seus cartões de crédito para acompanhar os gastos e
              limites
            </Text>
          </Card>
        ) : (
          (() => {
            try {
              return data.cards
                .filter(card => {
                  if (!card || !card.id) {
                    console.warn('⚠️ Cartão inválido filtrado:', card);
                    return false;
                  }
                  return true;
                })
                .map((card) => {
                try {
                  // Verificação de segurança para transações
                  const transactions = data.transactions || [];
                  const despesasCartao = transactions.filter(t => 
                    t && t.type === 'expense' && t.cardId === card.id
                  );
                  
                  // Conversões seguras com valores padrão
                  const cardLimit = card.limit ? Number(card.limit) : 0;
                  const cardSpending = despesasCartao.reduce((sum, t) => {
                    const amount = t && t.amount ? Number(t.amount) : 0;
                    return sum + amount;
                  }, 0);
                  
                  const utilization = cardLimit > 0 ? (cardSpending / cardLimit) * 100 : 0;
                  const available = cardLimit - cardSpending;

                  return (
                    <Card key={card.id} style={styles.cardItem}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardInfo}>
                          {/* Exibir imagem do banco se houver no cache global, senão emoji, senão nome */}
                          {(() => {
                            try {
                              console.log('🔍 Renderizando ícone para cartão:', {
                                cardId: card?.id,
                                cardIcon: card?.icon,
                                cardType: typeof card,
                                iconsType: typeof ICONS,
                                iconsLength: ICONS?.length,
                                globalCacheType: typeof globalImageCache,
                                globalCacheKeys: globalImageCache ? Object.keys(globalImageCache) : 'undefined'
                              });

                              // Verificações de segurança extras
                              if (!card || typeof card !== 'object') {
                                console.warn('⚠️ Card object inválido:', card);
                                return <Text style={{ marginRight: 8, color: theme.colors.textSecondary }}>💳</Text>;
                              }

                              if (!ICONS || !Array.isArray(ICONS)) {
                                console.warn('⚠️ ICONS não está definido ou não é array:', ICONS);
                                return <Text style={{ marginRight: 8, color: theme.colors.textSecondary }}>💳</Text>;
                              }

                              const iconValue = card.icon && typeof card.icon === 'string' 
                                ? card.icon.toLowerCase().trim() 
                                : '';
                              
                              console.log('🔍 IconValue processado:', iconValue);

                              if (!iconValue) {
                                console.log('🔍 IconValue vazio, usando emoji padrão');
                                return (
                                  <Text style={{ marginRight: 8, color: theme.colors.textSecondary }}>💳</Text>
                                );
                              }

                              const iconOption = ICONS.find(i => {
                                if (!i || typeof i !== 'object') return false;
                                return (
                                  (i.key && i.key.toLowerCase() === iconValue) ||
                                  (i.label && i.label.toLowerCase() === iconValue)
                                );
                              });
                              
                              console.log('🔍 IconOption encontrado:', iconOption);

                              if (iconOption && iconOption.image && globalImageCache && globalImageCache[iconOption.key]) {
                                console.log('🔍 Usando imagem do cache:', globalImageCache[iconOption.key]);
                                return (
                                  <Image
                                    source={{ uri: globalImageCache[iconOption.key] }}
                                    style={{ width: 32, height: 32, marginRight: 8 }}
                                    resizeMode="contain"
                                  />
                                );
                              } else if (iconOption && iconOption.emoji) {
                                console.log('🔍 Usando emoji:', iconOption.emoji);
                                return (
                                  <Text style={{ fontSize: 28, marginRight: 8 }}>{iconOption.emoji}</Text>
                                );
                              } else {
                                console.log('🔍 Usando fallback text:', card.icon);
                                return (
                                  <Text style={{ marginRight: 8, color: theme.colors.textSecondary }}>
                                    {card.icon || '💳'}
                                  </Text>
                                );
                              }
                            } catch (iconError) {
                              console.error('❌ Erro ao renderizar ícone do cartão:', iconError);
                              if (iconError instanceof Error) {
                                console.error('❌ Stack trace:', iconError.stack);
                              }
                              return (
                                <Text style={{ marginRight: 8, color: theme.colors.textSecondary }}>💳</Text>
                              );
                            }
                          })()}
                          <Text style={styles.cardName}>{card.name || 'Cartão sem nome'}</Text>
                        </View>
                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            onPress={() => handleEdit(card)}
                            style={styles.actionButton}
                          >
                            <Edit3 size={16} color={theme.colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(card)}
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
                          {`R$ ${cardSpending.toFixed(2)} utilizado`}
                        </Text>
                      </View>

                      <View style={styles.datesRow}>
                        <Text style={styles.dateText}>
                          Fechamento: dia {card.closingDay || 1}
                        </Text>
                        <Text style={styles.dateText}>
                          Vencimento: dia {card.dueDay || 1}
                        </Text>
                      </View>
                    </Card>
                  );
                } catch (cardError) {
                  console.error('❌ Erro ao renderizar cartão:', card.id, cardError);
                  return (
                    <Card key={card.id || Math.random()} style={styles.cardItem}>
                      <Text style={{ color: theme.colors.error, textAlign: 'center', padding: 16 }}>
                        Erro ao carregar cartão
                      </Text>
                    </Card>
                  );
                }
              });
            } catch (error) {
              console.error('❌ Erro ao processar lista de cartões:', error);
              return (
                <Card style={styles.emptyCard}>
                  <Text style={{ color: theme.colors.error, textAlign: 'center' }}>
                    Erro ao carregar cartões
                  </Text>
                </Card>
              );
            }
          })()
        )}
      </ScrollView>
      {/* Modal de escolha do método de cadastro do cartão */}
      <AddCardMethodModal
        ref={addCardModalRef}
        addCardModalVisible={addCardModalVisible}
        editingCard={editingCard ? { ...(editingCard as any), account: selectedAccountForModal || (editingCard as any).account } : selectedAccountForModal ? ({ account: selectedAccountForModal } as any) : undefined}
        onSave={async (cardData, editingId) => {
          if (editingId) {
            await updateCard(editingId, cardData);
          } else {
            await addCard(cardData);
          }
          setEditingCard(null);
          setAddCardModalVisible(false);
          setSelectedAccountForModal(null);
        }}
        onManualPress={() => {
          setEditingCard(null);
          setAddCardModalVisible(true);
          if (addCardModalRef.current && addCardModalRef.current.openManual) {
            addCardModalRef.current.openManual();
          }
        }}
        onOpenFinancePress={() => {
          if (addCardModalRef.current) {
            addCardModalRef.current.close();
          }
          // lógica futura para Open Finance
        }}
      />

      {/* Modal de confirmação de remoção */}
      <Modalize
        ref={removeModalRef}
        adjustToContentHeight
        modalStyle={{ padding: 24, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: theme.colors.text }}>
          Remover Cartão
        </Text>
        <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginBottom: 24, textAlign: 'center' }}>
          Tem certeza que deseja remover o cartão{' '}
          <Text style={{ fontWeight: 'bold', color: theme.colors.error }}>{cardToRemove?.name}</Text>?
          Esta ação não poderá ser desfeita.
        </Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Button
            title="Cancelar"
            variant="outline"
            style={{ flex: 1, marginRight: 8 }}
            onPress={cancelRemove}
          />
          <Button
            title="Remover"
            style={{ flex: 1, backgroundColor: theme.colors.error }}
            textStyle={{ color: '#fff' }}
            onPress={confirmRemove}
          />
        </View>
      </Modalize>
    </View>
    </ErrorBoundary>
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