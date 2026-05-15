import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNotifications } from '../hooks/useNotifications';
import { useHistory } from '../hooks/useHistory';
import { theme } from '../theme/AnalogPrecisionist';
import { ContainerCard } from '../components/Cards';
import { Headline, Body, HeadlineSmall, TechnicalSmall } from '../components/Typography';
import { StatusOrb } from '../components/StatusOrb';

export default function NotificationsScreen() {
  const { expoPushToken } = useNotifications();
  const { history, fetchHistory } = useHistory();

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const notifications = history.filter(item => item.type === 'Hardware Alert' || item.type === 'Reminder' || item.type === 'Manual');

  return (
    <View style={styles.container}>
      <Headline style={styles.title}>System Alerts & Reminders</Headline>
      
      <ContainerCard>
        <HeadlineSmall style={styles.mb}>FCM Registration</HeadlineSmall>
        <View style={styles.orbRow}>
          <StatusOrb isActive={!!expoPushToken} />
          <Body style={styles.ml}>{expoPushToken ? "Connection Active" : "Pending Authentication..."}</Body>
        </View>
      </ContainerCard>
      
      <View style={styles.sectionSpacing}>
        <HeadlineSmall style={styles.mb}>Recent Activity</HeadlineSmall>
        
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Body style={styles.empty}>No automated reminders or critical alerts currently on device.</Body>}
          renderItem={({ item }) => {
            const isAlert = item.type === 'Hardware Alert';
            const badgeStyle = isAlert ? [styles.badge, styles.criticalBadge] : styles.badge;
            
            return (
              <View style={styles.rule}>
                <TechnicalSmall style={badgeStyle}>
                  {item.type.toUpperCase()}
                </TechnicalSmall>
                <View style={{flex: 1}}>
                  <Body numberOfLines={1}>{item.med_name || "Device Activity"}</Body>
                  <TechnicalSmall style={styles.subtext}>
                    {new Date(item.actual_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </TechnicalSmall>
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 60,
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
  },
  subtext: {
    color: theme.colors.outlineVariant,
    marginTop: 2,
  },
  empty: {
    color: theme.colors.outlineVariant,
    marginTop: theme.spacing.md,
  }
});
