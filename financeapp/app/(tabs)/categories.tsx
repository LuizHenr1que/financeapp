import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Plus, CreditCard as Edit3, Trash2, Circle, ShoppingCart, Home, Utensils, Car, Heart, Book, Gift, Film, Wifi, Smartphone, Briefcase, Globe, Music, Star, Check } from 'lucide-react-native';
import { Modalize } from 'react-native-modalize';

import { theme } from '@/theme';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Header } from '@/components/Header';
import { CategoryModal, CategoryModalRef } from '@/components/CategoryModal';
import { Category } from '@/types';

// Defina o array colors fora do componente para garantir referência estável
const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
  '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
  '#00d2d3', '#ff9f43', '#10ac84', '#ee5253',
];

export default function CategoriesScreen() {
  const { data, addCategory, updateCategory, deleteCategory } = useData();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const categoryModalRef = useRef<CategoryModalRef>(null);
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [pendingSave, setPendingSave] = useState<any>(null);
  const prevCategoriesLength = useRef(data.categories.length);

  const iconOptions = [
    'Circle', 'ShoppingCart', 'Home', 'Utensils', 'Car', 'Heart', 'Book', 'Gift', 'Film', 'Wifi', 'Smartphone', 'Briefcase', 'Globe', 'Music', 'Star',
  ];
  const iconComponents = {
    Circle: Circle,
    ShoppingCart: ShoppingCart,
    Home: Home,
    Utensils: Utensils,
    Car: Car,
    Heart: Heart,
    Book: Book,
    Gift: Gift,
    Film: Film,
    Wifi: Wifi,
    Smartphone: Smartphone,
    Briefcase: Briefcase,
    Globe: Globe,
    Music: Music,
    Star: Star,
  };

  const handleViewPress = () => {
    console.log('Visualização pressionada');
  };

  const handleFilterPress = () => {
    console.log('Filtro pressionado');
  };

  const handleSearchPress = () => {
    console.log('Busca pressionada');
  };

  const handleEdit = (category: Category) => {
    setModalInitialData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type,
    });
    setEditingCategory(category);
    setTimeout(() => {
      categoryModalRef.current?.open();
    }, 0);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setModalInitialData(null);
    categoryModalRef.current?.open();
  };

  const handleDelete = (categoryId: string) => {
    Alert.alert(
      'Excluir Categoria',
      'Tem certeza que deseja excluir esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteCategory(categoryId),
        },
      ]
    );
  };

  // Salvar categoria e aguardar atualização do contexto antes de fechar o modal
  const handleModalSave = async (form: any) => {
    if (!form.name.trim()) {
      Alert.alert('Erro', 'Digite o nome da categoria');
      return;
    }
    try {
      if (editingCategory) {
        setPendingSave({ ...form, id: editingCategory.id });
      } else {
        setPendingSave(form);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar a categoria');
    }
  };

  // Fecha o modal somente após a atualização do contexto
  useEffect(() => {
    if (pendingSave) {
      const save = async () => {
        try {
          if (pendingSave.id) {
            await updateCategory(pendingSave.id, pendingSave);
          } else {
            await addCategory(pendingSave);
          }
          setEditingCategory(null);
          setModalInitialData(null);
        } catch (error: any) {
          Alert.alert('Erro', error.message || 'Não foi possível salvar a categoria');
        } finally {
          setPendingSave(null);
        }
      };
      save();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSave]);

  useEffect(() => {
    if (pendingSave === null && prevCategoriesLength.current !== data.categories.length) {
      categoryModalRef.current?.close();
      prevCategoriesLength.current = data.categories.length;
    }
  }, [data.categories.length, pendingSave]);

  const incomeCategories = data.categories.filter(cat => cat.type === 'income');
  const expenseCategories = data.categories.filter(cat => cat.type === 'expense');

  // Logs para verificar os dados
  console.log('📂 Categorias carregadas no contexto:', data.categories.length);
  console.log('📂 Categorias de receita:', incomeCategories.length);
  console.log('📂 Categorias de despesa:', expenseCategories.length);
  
  if (data.categories.length > 0) {
    console.log('📋 Primeiras categorias:', data.categories.slice(0, 3).map(c => ({ id: c.id, name: c.name, type: c.type })));
  }

  return (
    <View style={styles.container}>
      <Header 
        type="categories"
        onViewPress={handleViewPress}
        onFilterPress={handleFilterPress}
        onSearchPress={handleSearchPress}
      />
      <ScrollView style={styles.content}>
        {/* Add Category Button */}
        <Card style={styles.addButtonCard}>
          <TouchableOpacity
            onPress={handleAdd}
            style={styles.addCategoryButton}
          >
            <Plus size={24} color={theme.colors.primary} />
            <Text style={styles.addCategoryText}>Adicionar Nova Categoria</Text>
          </TouchableOpacity>
        </Card>

        {/*Categorias de Despesa */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Categorias de Despesa</Text>
          {expenseCategories.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma categoria de despesa</Text>
          ) : (
            expenseCategories.map(category => {
              const Icon = iconComponents[category.icon as keyof typeof iconComponents] || Circle;
              return (
                <View key={category.id} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color, alignItems: 'center', justifyContent: 'center' }]}> 
                      <Icon size={16} color="#fff" />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryActions}>
                    <TouchableOpacity
                      onPress={() => handleEdit(category)}
                      style={styles.actionButton}
                    >
                      <Edit3 size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(category.id)}
                      style={styles.actionButton}
                    >
                      <Trash2 size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </Card>

        {/*Categorias de Receita */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Categorias de Receita</Text>
          {incomeCategories.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma categoria de receita</Text>
          ) : (
            incomeCategories.map(category => {
              const Icon = iconComponents[category.icon as keyof typeof iconComponents] || Circle;
              return (
                <View key={category.id} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color, alignItems: 'center', justifyContent: 'center' }]}> 
                      <Icon size={16} color="#fff" />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryActions}>
                    <TouchableOpacity
                      onPress={() => handleEdit(category)}
                      style={styles.actionButton}
                    >
                      <Edit3 size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(category.id)}
                      style={styles.actionButton}
                    >
                      <Trash2 size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>
      {/* Modal de Nova Categoria ou Edição */}
      <CategoryModal
        ref={categoryModalRef}
        onClose={() => {
          setEditingCategory(null);
          setModalInitialData(null);
        }}
        onSave={handleModalSave}
        colors={colors}
        initialData={modalInitialData}
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
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md, 
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  addCategoryText: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: theme.spacing.md,
  },
  categoryName: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.text,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: theme.typography.medium,
    fontWeight: '600',
    color: theme.colors.text,
  },
  typeButtonTextActive: {
    color: theme.colors.title,
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