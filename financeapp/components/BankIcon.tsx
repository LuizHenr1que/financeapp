import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import CachedImage from './CachedImage';
import { ICONS } from './AccountIconSelectorModal';
import { theme } from '@/theme';

interface BankIconProps {
  bankKey: string;
  size?: number;
  style?: ViewStyle;
  showLabel?: boolean;
  labelStyle?: any;
}

export default function BankIcon({ 
  bankKey, 
  size = 32, 
  style, 
  showLabel = false,
  labelStyle 
}: BankIconProps) {
  const icon = ICONS.find(icon => icon.key === bankKey);

  if (!icon) {
    return (
      <View style={[styles.fallbackContainer, { width: size, height: size }, style]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>?</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { width: size, height: size }]}>
        {icon.image && icon.image.uri ? (
          <CachedImage
            cacheKey={icon.key}
            sourceUrl={icon.image.uri}
            fallbackEmoji={icon.emoji}
            style={{ width: size, height: size }}
            resizeMode="contain"
          />
        ) : (
          <Text style={{ fontSize: size * 0.8 }}>{icon.emoji}</Text>
        )}
      </View>
      
      {showLabel && (
        <Text style={[styles.label, labelStyle]}>{icon.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fallbackContainer: {
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fallbackText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
