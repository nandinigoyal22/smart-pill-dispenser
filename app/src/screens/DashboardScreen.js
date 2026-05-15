import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { writePin } from '../services/blynk';
import { useDevice } from '../hooks/useDevice';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { useSchedule } from '../hooks/useSchedule';
import { useHistory } from '../hooks/useHistory';
import { theme } from '../theme/AnalogPrecisionist';
import { ElevatedCard, ContainerCard } from '../components/Cards';
import { StatusOrb } from '../components/StatusOrb';
import { Headline, HeadlineSmall, Body, Technical, TechnicalSmall } from '../components/Typography';

export default function DashboardScreen() {
  const { sensorData, lastEvent } = useDevice();
  const deviceStatus = useDeviceStatus();
  const { getNextDose } = useSchedule();
  const { addHistoryEvent } = useHistory();
  
  const [nextDose, setNextDose] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // If the Wokwi status says it's dispensing, or our local sync state is locked
  const isDispensing = deviceStatus.currentState === 'DISPENSING' || isSyncing;

  const handleRefresh = useCallback(() => {
    setNextDose(getNextDose());
  }, [getNextDose]);

  const handleDispenseOverride = () => {
    Alert.alert(
      "Manual Dispense...",
      "The hardware will physically dispense right now.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            setIsSyncing(true);
            
            // Mimic physical button press by toggling 1 -> 0 quickly
            await writePin('V3', 1);
            
            setTimeout(async () => {
              await writePin('V3', 0);
              setIsSyncing(false);
              
              addHistoryEvent({ 
                type: 'Manual', 
                med_name: nextDose ? nextDose.med : "Unscheduled Pill", 
                scheduled_time: 'N/A',
                temp: sensorData.temperature, 
                humidity: sensorData.humidity 
              });
              
            }, 500);
          }
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [handleRefresh])
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Headline>Medical Directions</Headline>
          <View style={styles.statusRow}>
            <StatusOrb isActive={deviceStatus.online && !deviceStatus.isStale} />
            <TechnicalSmall style={styles.statusText}>
              {deviceStatus.currentState || 'IDLE'}
            </TechnicalSmall>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <Body style={styles.refreshText}>Refresh</Body>
        </TouchableOpacity>
      </View>

      <ElevatedCard>
        <HeadlineSmall>Next Dose</HeadlineSmall>
        {nextDose ? (
          <View style={styles.doseRow}>
            <Technical style={styles.timeEmphasis}>{nextDose.time}</Technical>
            <Body>{nextDose.med}</Body>
          </View>
        ) : (
          <Body style={styles.emptyText}>No upcoming doses scheduled.</Body>
        )}
      </ElevatedCard>

      <ContainerCard>
        <HeadlineSmall>Hardware Readings</HeadlineSmall>
        <View style={styles.capsuleRow}>
          <View style={[styles.dataBlock, { flex: 1 }]}>
            <TechnicalSmall>CAPACITY</TechnicalSmall>
            <Technical>{deviceStatus.containerEmpty ? 'EMPTY' : `${sensorData.pill_level_pct}%`}</Technical>
          </View>
          <View style={styles.dataBlock}>
            <TechnicalSmall>TEMP / HUMIDITY</TechnicalSmall>
            <Technical>{sensorData.temperature}°C / {sensorData.humidity}%</Technical>
          </View>
        </View>
        <View style={styles.capsuleRow}>
            <TechnicalSmall>Lid Integrity: </TechnicalSmall>
            <Body style={{ color: deviceStatus.lidOpen ? theme.colors.error : theme.colors.onSurface }}>
              {deviceStatus.lidOpen ? 'COMPROMISED' : 'SECURE'}
            </Body>
        </View>
      </ContainerCard>

      {lastEvent && (
        <ContainerCard>
          <HeadlineSmall>Previous Registry</HeadlineSmall>
          <View style={styles.capsuleRow}>
            <Body>Status: {lastEvent.type.toUpperCase()}</Body>
            <TechnicalSmall>{new Date(lastEvent.timestamp).toLocaleTimeString()}</TechnicalSmall>
          </View>
        </ContainerCard>
      )}

      {deviceStatus.isStale && (
        <View style={styles.warningBox}>
          <TechnicalSmall style={{color: theme.colors.onErrorContainer}}>WARNING: CONNECTION LOST</TechnicalSmall>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.primaryBtn, isDispensing && { backgroundColor: theme.colors.outlineVariant }]} 
        onPress={handleDispenseOverride} 
        disabled={isDispensing}
        activeOpacity={0.8}
      >
        {isDispensing ? (
          <ActivityIndicator color={theme.colors.surface} />
        ) : (
          <Body style={styles.primaryBtnText}>Dispense Override</Body>
        )}
      </TouchableOpacity>
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    marginTop: theme.spacing.md,
  },
  refreshBtn: {
    backgroundColor: theme.colors.surfaceContainerHighest,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.round,
  },
  refreshText: {
    fontFamily: 'DMSans_500Medium',
    color: theme.colors.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  statusText: {
    marginLeft: theme.spacing.xs,
    textTransform: 'uppercase',
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  timeEmphasis: {
    fontSize: 28,
    marginRight: theme.spacing.lg,
    color: theme.colors.secondary,
  },
  emptyText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.outlineVariant,
  },
  capsuleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  dataBlock: {
    marginBottom: theme.spacing.sm,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.radii.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  primaryBtnText: {
    color: theme.colors.inverseOnSurface,
    fontFamily: 'DMSans_500Medium',
  },
  warningBox: {
    backgroundColor: theme.colors.errorContainer,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.lg,
  }
});
