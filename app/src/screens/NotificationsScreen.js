import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { theme } from '../theme/AnalogPrecisionist';
import { ContainerCard } from '../components/Cards';
import { Headline, Body, HeadlineSmall, TechnicalSmall } from '../components/Typography';
import { StatusOrb } from '../components/StatusOrb';

export default function NotificationsScreen() {
  const { expoPushToken } = useNotifications();

  return (
    <ScrollView style={styles.container}>
      <Headline style={styles.title}>System Alerts</Headline>
      
      <ContainerCard>
        <HeadlineSmall style={styles.mb}>FCM Registration</HeadlineSmall>
        <View style={styles.orbRow}>
          <StatusOrb isActive={!!expoPushToken} />
          <Body style={styles.ml}>{expoPushToken ? "Connection Active" : "Pending Authentication..."}</Body>
        </View>
      </ContainerCard>
      
      <View style={styles.sectionSpacing}>
        <HeadlineSmall style={styles.mb}>Alert Protocol</HeadlineSmall>
        
        <View style={styles.rule}>
          <TechnicalSmall style={styles.badge}>WARNING</TechnicalSmall>
          <Body>Missed Dosage (Failsafe timeout)</Body>
        </View>
        
        <View style={styles.rule}>
          <TechnicalSmall style={[styles.badge, styles.criticalBadge]}>CRITICAL</TechnicalSmall>
          <Body>Unauthorized Lid Intrusion</Body>
        </View>
        
        <View style={styles.rule}>
          <TechnicalSmall style={[styles.badge, styles.criticalBadge]}>CRITICAL</TechnicalSmall>
          <Body>Reservoir Depletion Block</Body>
        </View>
        
        <View style={styles.rule}>
          <TechnicalSmall style={styles.badge}>WARNING</TechnicalSmall>
          <Body>Hardware Interface Offline (`>15m`)</Body>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
  },
  title: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  mb: {
    marginBottom: theme.spacing.sm,
  },
  ml: {
    marginLeft: theme.spacing.sm,
  },
  orbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
  },
  sectionSpacing: {
    marginTop: theme.spacing.xl,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  badge: {
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.round,
    marginRight: theme.spacing.md,
    width: 80,
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant
  },
  criticalBadge: {
    backgroundColor: theme.colors.errorContainer,
    color: theme.colors.onErrorContainer,
  }
});
