import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme/AnalogPrecisionist';

export const ElevatedCard = ({ children, style }) => (
  <View style={[styles.elevatedCard, style]}>
    {children}
  </View>
);

export const ContainerCard = ({ children, style }) => (
  <View style={[styles.containerCard, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  // The highest elevation - true white on top of parchment white
  elevatedCard: {
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: theme.radii.md,
    padding: theme.spacing.lg,
    // Ambient shadows: Y=8px, blur=32px, 4% opacity of on-surface (#1d1c17)
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 3, // For Android approximation
    marginBottom: theme.spacing.md,
  },
  // The secondary "shifted" background. No border.
  containerCard: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  }
});
