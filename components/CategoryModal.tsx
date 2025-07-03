import React, { useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Check, Circle, ShoppingCart, Home, Utensils, Car, Heart, Book, Gift, Film, Wifi, Smartphone, Briefcase, Globe, Music, Star } from 'lucide-react-native';
import { theme } from '@/theme';
import InputLogin from '@/components/InputLogin';
import { Button } from '@/components/Button';
import { PiggyBank, Coffee, ShoppingBag, DollarSign, Apple, Beer, Camera, Cloud, Cpu, Droplet, Feather, Flag, Leaf, Lightbulb, MapPin, Moon, Sun, Target, Thermometer, Truck, User, Users, Watch, Zap, Bell, Calendar, Clipboard, Eye, Folder, Key, Lock, Pen, Phone, Printer, Scissors, Send, Settings, Shield, ShoppingCart as Cart2, Smile, Speaker, ThumbsUp, Trash2, Wifi as Wifi2 } from 'lucide-react-native';

const iconOptions = [
  'Circle', 'ShoppingCart', 'Home', 'Utensils', 'Car', 'Heart', 'Book', 'Gift', 'Film', 'Wifi', 'Smartphone', 'Briefcase', 'Globe', 'Music', 'Star',
  'PiggyBank', 'Coffee', 'ShoppingBag', 'DollarSign', 'Apple', 'Beer', 'Camera', 'Cloud', 'Cpu', 'Droplet', 'Feather', 'Flag', 'Leaf', 'Lightbulb', 'MapPin', 'Moon', 'Sun', 'Target', 'Thermometer', 'Truck', 'User', 'Users', 'Watch', 'Zap',
  'Bell', 'Calendar', 'Clipboard', 'Eye', 'Folder', 'Key', 'Lock', 'Pen', 'Phone', 'Printer', 'Scissors', 'Send', 'Settings', 'Shield', 'Cart2', 'Smile', 'Speaker', 'ThumbsUp', 'Trash2', 'Wifi2',
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
  PiggyBank: PiggyBank,
  Coffee: Coffee,
  ShoppingBag: ShoppingBag,
  DollarSign: DollarSign,
  Apple: Apple,
  Beer: Beer,
  Camera: Camera,
  Cloud: Cloud,
  Cpu: Cpu,
  Droplet: Droplet,
  Feather: Feather,
  Flag: Flag,
  Leaf: Leaf,
  Lightbulb: Lightbulb,
  MapPin: MapPin,
  Moon: Moon,
  Sun: Sun,
  Target: Target,
  Thermometer: Thermometer,
  Truck: Truck,
  User: User,
  Users: Users,
  Watch: Watch,
  Zap: Zap,
  Bell: Bell,
  Calendar: Calendar,
  Clipboard: Clipboard,
  Eye: Eye,
  Folder: Folder,
  Key: Key,
  Lock: Lock,
  Pen: Pen,
  Phone: Phone,
  Printer: Printer,
  Scissors: Scissors,
  Send: Send,
  Settings: Settings,
  Shield: Shield,
  Cart2: Cart2,
  Smile: Smile,
  Speaker: Speaker,
  ThumbsUp: ThumbsUp,
  Trash2: Trash2,
  Wifi2: Wifi2,
};

// Função utilitária para dividir o array de ícones em colunas de 3 linhas (3 ícones por coluna)
function getIconGrid(icons: string[], rows = 3) {
  const cols = Math.ceil(icons.length / rows);
  const grid: string[][] = [];
  for (let i = 0; i < cols; i++) {
    grid.push(icons.slice(i * rows, (i + 1) * rows));
  }
  return grid;
}

export type CategoryModalRef = {
  open: () => void;
  close: () => void;
};

interface Props {
  onClose: () => void;
  onClosed?: () => void;
  onSave: (data: any) => void;
  colors: string[];
  initialData?: {
    name: string;
    color: string;
    icon: string;
    type: string;
  } | null;
}

export const CategoryModal = forwardRef<CategoryModalRef, Props>(({ onClose, onClosed, onSave, colors, initialData }, ref) => {
  const modalizeRef = useRef<Modalize>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: colors[0] || '#1de9b6',
    icon: 'Circle',
    type: 'expense',
  });
  const [isEssential, setIsEssential] = useState(false);
  const [pendingData, setPendingData] = useState<typeof initialData | null>(null);

  // Atualiza o pendingData ao abrir para edição
  const handleOpen = useCallback(() => {
    setPendingData(initialData || null);
    modalizeRef.current?.open();
  }, [initialData]);

  // Quando o modal realmente abrir, atualiza o formData
  const handleModalOpened = useCallback(() => {
    if (pendingData) {
      setFormData({
        name: pendingData.name,
        color: pendingData.color,
        icon: pendingData.icon,
        type: pendingData.type,
      });
    } else {
      setFormData({ name: '', color: colors[0] || '#1de9b6', icon: 'Circle', type: 'expense' });
    }
    setIsEssential(false);
  }, [pendingData, colors]);

  const handleClose = useCallback(() => {
    modalizeRef.current?.close();
  }, []);

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }), [handleOpen, handleClose]);

  // Função estável para evitar re-renderizações desnecessárias
  const handleInputChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, name: text }));
  }, []);

  const handleColorSelect = useCallback((color: string) => {
    setFormData(prev => ({ ...prev, color }));
  }, []);

  const handleIconSelect = useCallback((icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.name.trim()) {
      return;
    }
    onSave({ ...formData, essential: isEssential });
    modalizeRef.current?.close();
  }, [formData, isEssential, onSave]);

  return (
    <Modalize
      ref={modalizeRef}
      adjustToContentHeight
      handleStyle={{ backgroundColor: theme.colors.primary }}
      modalStyle={{ backgroundColor: theme.colors.background, borderTopLeftRadius: theme.borderRadius.large, borderTopRightRadius: theme.borderRadius.large }}
      onClose={onClose}
      onClosed={onClosed}
      onOpened={handleModalOpened}
    >
      <View style={styles.modalContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nome da Categoria</Text>
          <InputLogin
            value={formData.name}
            onChangeText={handleInputChange}
            placeholder="Ex: Alimentação"
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
        <Text style={styles.sectionTitle}>Cor</Text>
        <FlatList
          data={colors}
          horizontal
          keyExtractor={(item) => item}
          contentContainerStyle={{ marginBottom: theme.spacing.md }}
          renderItem={({ item: color }) => (
            <TouchableOpacity
              style={[
                styles.colorOption,
                { backgroundColor: color },
                formData.color === color && styles.colorOptionSelected,
              ]}
              onPress={() => handleColorSelect(color)}
            />
          )}
          showsHorizontalScrollIndicator={false}
        />
        <Text style={styles.sectionTitle}>Escolha um ícone</Text>
        <FlatList
          data={getIconGrid(iconOptions, 3)}
          horizontal
          keyExtractor={(_, idx) => 'col-' + idx}
          contentContainerStyle={{ marginBottom: theme.spacing.md }}
          initialNumToRender={4} // Renderiza só 4 colunas inicialmente
          windowSize={5} // Mantém poucas colunas em memória
          removeClippedSubviews={true} // Remove colunas fora da tela
          renderItem={({ item: col }) => (
            <View style={{ flexDirection: 'column', marginRight: theme.spacing.md }}>
              {col.map((icon) => {
                const Icon = iconComponents[icon as keyof typeof iconComponents];
                const isSelected = formData.icon === icon;
                return (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      isSelected && styles.iconOptionSelected,
                    ]}
                    onPress={() => handleIconSelect(icon)}
                  >
                    <Icon size={28} color={isSelected ? theme.colors.primary : theme.colors.textSecondary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
        {/* deixar comentado por enquanto */}
        {/* <View style={styles.essentialRow}>
          <TouchableOpacity
            style={styles.essentialCard}
            onPress={() => setIsEssential(!isEssential)}
            activeOpacity={0.85}
          >
            <View style={styles.essentialCardContent}>
              <View style={[
                styles.checkbox,
                isEssential && styles.checkboxChecked,
              ]}>
                <View style={[
                  styles.checkboxInner,
                  isEssential && styles.checkboxInnerChecked,
                ]}>
                  {isEssential && <Check size={20} color={theme.colors.primary} />}
                </View>
              </View>
              <Text style={styles.essentialLabel}>Marcar como essencial</Text>
            </View>
          </TouchableOpacity>
        </View> */}
        <View style={styles.buttonRow}>
          <Button
            title="Cancelar"
            onPress={handleClose}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Salvar"
            onPress={handleSave}
            style={styles.button}
          />
        </View>
      </View>
    </Modalize>
  );
});

const styles = StyleSheet.create({
  modalContent: {
    padding: theme.spacing.lg,
  },
  editTitle: {
    fontSize: theme.typography.title,
    fontWeight: 'bold',
    color: theme.colors.title,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: theme.spacing.sm,
  },
  colorOptionSelected: {
    borderColor: theme.colors.text,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: theme.colors.background,
  },
  iconOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '22',
  },
  essentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    justifyContent: 'flex-start',
  },
  essentialCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 1,
  },
  essentialCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  essentialLabel: {
    fontSize: theme.typography.medium,
    color: theme.colors.text,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    marginRight: theme.spacing.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    transitionProperty: 'border-color, background-color',
    transitionDuration: '200ms',
  },
  checkboxChecked: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '22',
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    transitionProperty: 'background-color',
    transitionDuration: '200ms',
  },
  checkboxInnerChecked: {
    backgroundColor: theme.colors.background,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
});
