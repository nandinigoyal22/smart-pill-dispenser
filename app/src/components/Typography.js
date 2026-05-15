import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../theme/AnalogPrecisionist';

export const Display = ({ children, style, ...props }) => (
  <Text style={[styles.display, style]} {...props}>{children}</Text>
);

export const Headline = ({ children, style, ...props }) => (
  <Text style={[styles.headline, style]} {...props}>{children}</Text>
);

export const HeadlineSmall = ({ children, style, ...props }) => (
  <Text style={[styles.headlineSmall, style]} {...props}>{children}</Text>
);

export const Body = ({ children, style, ...props }) => (
  <Text style={[styles.body, style]} {...props}>{children}</Text>
);

export const Technical = ({ children, style, ...props }) => (
  <Text style={[styles.technical, style]} {...props}>{children}</Text>
);

export const TechnicalSmall = ({ children, style, ...props }) => (
  <Text style={[styles.technicalSmall, style]} {...props}>{children}</Text>
);

const styles = StyleSheet.create({
  display: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 42,
    lineHeight: 52,
    color: theme.colors.primary,
  },
  headline: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 28,
    lineHeight: 36,
    color: theme.colors.primary,
  },
  headlineSmall: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.primary,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.onSurface,
  },
  technical: {
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 18,
    lineHeight: 24,
    color: theme.colors.onSurface,
    letterSpacing: -0.5,
  },
  technicalSmall: {
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.onSurface,
  }
});
