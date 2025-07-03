import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from './Card';
import { ChevronRight } from 'lucide-react-native';
import { View as RNView } from 'react-native';
import { theme } from '@/theme';

export const addCardMethodOptionsStyles = StyleSheet.create({
  cardButton: {
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 0,
  },
  disabledCardButton: {
    backgroundColor: theme.colors.surface,
  },
  button: {
    padding: 20,
    alignItems: 'flex-start',
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  buttonDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'left',
    opacity: 0.8,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 6,
    fontWeight: '500',
    marginLeft: 2,
  },
  accountOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export type AddCardMethodOptionsProps = {
  title: string;
  manualTitle: string;
  manualDesc: string;
  openFinanceTitle: string;
  openFinanceDesc: string;
  onManualPress: () => void;
  style?: any;
  cardButtonStyle?: any;
  disabledCardButtonStyle?: any;
  buttonStyle?: any;
  buttonContentStyle?: any;
  buttonTitleStyle?: any;
  buttonDescStyle?: any;
};

export const AddCardMethodOptions: React.FC<AddCardMethodOptionsProps> = ({
  title,
  manualTitle,
  manualDesc,
  openFinanceTitle,
  openFinanceDesc,
  onManualPress,
  style,
  cardButtonStyle,
  disabledCardButtonStyle,
  buttonStyle,
  buttonContentStyle,
  buttonTitleStyle,
  buttonDescStyle,
}) => (
  <View style={style}>
    <Text style={[{ fontSize: 20, color: theme.colors.text, textAlign: 'left', marginBottom: 24, fontWeight: '600' }, buttonTitleStyle]}>
      {title} 
    </Text>
    <Card style={[{ marginBottom: 16, borderWidth: 1.5, borderColor: theme.colors.primary, backgroundColor: 'transparent', borderRadius: 16, padding: 0 }, cardButtonStyle]}>
      <TouchableOpacity style={[{ padding: 20, alignItems: 'flex-start', width: '100%' }, buttonStyle]} onPress={onManualPress}>
        <View style={[{ flexDirection: 'row', alignItems: 'center', width: '100%' }, buttonContentStyle]}>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 17, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4, textAlign: 'left', width: '100%' }, buttonTitleStyle]}>{manualTitle}</Text>
            <Text style={[{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'left', opacity: 0.8, width: '100%' }, buttonDescStyle]}>{manualDesc}</Text>
          </View>
          <ChevronRight size={24} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>
    </Card>
    <Card style={[
      { marginBottom: 16, borderWidth: 1.5, borderColor: theme.colors.primary, backgroundColor: 'transparent', borderRadius: 16, padding: 0 },
      cardButtonStyle,
      { backgroundColor: theme.colors.surface },
      disabledCardButtonStyle,
    ]}>
      <RNView style={[{ padding: 20, alignItems: 'flex-start', width: '100%', opacity: 0.5 }, buttonStyle]} pointerEvents="none">
        <View style={[{ flexDirection: 'row', alignItems: 'center', width: '100%' }, buttonContentStyle]}>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 17, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4, textAlign: 'left', width: '100%' }, buttonTitleStyle]}>
              {openFinanceTitle} <Text style={{ fontSize: 18 }}>🔗</Text>
            </Text>
            <Text style={[{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'left', opacity: 0.8, width: '100%' }, buttonDescStyle]}>{openFinanceDesc}</Text>
          </View>
          <ChevronRight size={24} color={theme.colors.primary} />
        </View>
      </RNView>
    </Card>
  </View>
);
