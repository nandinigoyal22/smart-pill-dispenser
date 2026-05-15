import React, { useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useHistory } from '../hooks/useHistory';
import { theme } from '../theme/AnalogPrecisionist';
import { Headline, Body, Technical, TechnicalSmall } from '../components/Typography';

export default function HistoryScreen() {
  const { history, loading, fetchHistory, exportCSV } = useHistory();

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Headline>Registry Log</Headline>
        <TouchableOpacity style={styles.syncBtn} onPress={() => fetchHistory()}>
          <Body style={styles.syncText}>Sync</Body>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <View style={styles.row}>
                <TechnicalSmall style={styles.timeTag}>
                  {new Date(item.actual_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </TechnicalSmall>
                <Body style={styles.typeText}>{item.type.toUpperCase()}</Body>
              </View>
              {['taken', 'missed'].includes(item.type) && (
                <View style={styles.metaRow}>
                  <Body style={styles.metric}>{item.med_name}</Body>
                  <TechnicalSmall style={styles.metric}>Sch: {item.scheduled_time}</TechnicalSmall>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Body style={styles.empty}>No logs on device.</Body>}
        />
      )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    marginTop: theme.spacing.md,
  },
  syncBtn: {
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.round,
  },
  syncText: {
    fontFamily: 'DMSans_500Medium',
  },
  logItem: {
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm, // NO borders used here per the design rule
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: theme.spacing.md,
  },
  typeText: {
    fontFamily: 'DMSans_500Medium',
    color: theme.colors.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface, // Background shift fake border
  },
  metric: {
    color: theme.colors.surfaceTint,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
    color: theme.colors.outlineVariant,
  }
});
