import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface LoadingProps {
  visible?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export function Loading({ 
  visible = true, 
  size = 'large', 
  color = theme.colors.primary 
}: LoadingProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.loadingBox}>
        <ActivityIndicator 
          size={size} 
          color={color} 
          style={styles.indicator}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.xl,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  indicator: {
    transform: [{ scale: 1.2 }],
  },
});
