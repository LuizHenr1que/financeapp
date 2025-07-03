import { Tabs } from 'expo-router';
import { Home, Receipt, Plus, Calendar, MoreHorizontal } from 'lucide-react-native';
import { View, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { useTransactionTypeModal } from '@/context/TransactionTypeModalContext';

export default function TabLayout() {
  const { openModal } = useTransactionTypeModal();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 10,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 70,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.small,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Principal',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transações',
          tabBarIcon: ({ size, color }) => (
            <Receipt size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 25,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 25,
              elevation: 8,
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            }}>
              <Plus size={24} color="white" />
            </View>
          ),
          tabBarButton: ({ children, style, ...props }) => (
            <TouchableOpacity
              style={style}
              onPress={openModal}
              activeOpacity={0.6}
            >
              {children}
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Planejamento',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Mais',
          tabBarIcon: ({ size, color }) => (
            <MoreHorizontal size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="cardsVisual"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="addTransaction"
        options={{
          href: null, // Hide from tabs
        }}
      />
    </Tabs>
  );
}