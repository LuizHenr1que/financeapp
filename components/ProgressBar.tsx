import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
  showLabel?: boolean;
  height?: number;
}

export function ProgressBar({ 
  current, 
  target, 
  color = theme.colors.primary, 
  showLabel = true,
  height = 8 
}: ProgressBarProps) {
  const progress = Math.min((current / target) * 100, 100);
  const percentage = Math.round(progress);

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${progress}%`, 
              backgroundColor: color,
              height 
            }
          ]} 
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>
          {percentage}% - R$ {current.toFixed(2)} / R$ {target.toFixed(2)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.small,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: theme.borderRadius.small,
  },
  label: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});