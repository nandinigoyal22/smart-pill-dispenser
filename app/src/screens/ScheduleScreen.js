import React, { useState } from 'react';
import { View, ScrollView, Switch, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useSchedule } from '../hooks/useSchedule';
import { theme } from '../theme/AnalogPrecisionist';
import { ContainerCard } from '../components/Cards';
import { Headline, HeadlineSmall, Body, Technical } from '../components/Typography';

export default function ScheduleScreen() {
  const { localSchedule, updateSlot, saveSchedule } = useSchedule();
  const [editingIndex, setEditingIndex] = useState(null);
  
  const scheduleSlots = [];
  for (let i = 0; i < 5; i++) {
    scheduleSlots.push({
      id: i,
      data: localSchedule[`slot_${i}`] || { time: '00:00', med: '', enabled: false }
    });
  }

  const syncToDevice = async () => {
    await saveSchedule();
  };

  return (
    <ScrollView style={styles.container}>
      <Headline style={styles.title}>Prescription Config</Headline>
      
      {scheduleSlots.map((item, index) => (
        <ContainerCard key={item.id.toString()}>
          {editingIndex === index ? (
            <View>
              <TextInput 
                style={styles.input}
                placeholder="00:00" 
                value={item.data.time}
                onChangeText={(txt) => updateSlot(index, { time: txt, med_name: item.data.med, enabled: item.data.enabled })}
              />
              <TextInput 
                style={styles.input}
                placeholder="Medication Name" 
                value={item.data.med}
                onChangeText={(txt) => updateSlot(index, { time: item.data.time, med_name: txt, enabled: item.data.enabled })}
              />
              <TouchableOpacity style={styles.secBtn} onPress={() => setEditingIndex(null)}>
                <Body style={styles.secBtnText}>Apply</Body>
              </TouchableOpacity>
            </View>
          ) : (
             <View style={styles.slotRow}>
               <View style={{flex: 1}}>
                 <Technical>{item.data.time}</Technical>
                 <Body style={styles.medLabel}>{item.data.med || 'Unassigned'}</Body>
               </View>
               <Switch 
                 value={item.data.enabled} 
                 onValueChange={(val) => updateSlot(index, { time: item.data.time, med_name: item.data.med, enabled: val })}
                 trackColor={{ false: theme.colors.surfaceDim, true: theme.colors.secondaryContainer }}
                 thumbColor={item.data.enabled ? theme.colors.secondary : theme.colors.outlineVariant}
               />
               <TouchableOpacity onPress={() => setEditingIndex(index)} style={styles.editWrap}>
                 <Body style={styles.editText}>Edit</Body>
               </TouchableOpacity>
             </View>
          )}
        </ContainerCard>
      ))}

      <TouchableOpacity style={styles.primaryBtn} onPress={syncToDevice} activeOpacity={0.8}>
        <Body style={styles.primaryBtnText}>Commit to Hardware</Body>
      </TouchableOpacity>
      
      <View style={{height: 40}}/>
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
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medLabel: {
    color: theme.colors.surfaceTint,
    marginTop: 4,
  },
  editWrap: {
    marginLeft: theme.spacing.lg,
  },
  editText: {
    color: theme.colors.secondary,
    fontFamily: 'DMSans_500Medium',
  },
  input: {
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceDim,
    paddingVertical: 8,
    marginBottom: 16,
    color: theme.colors.primary,
  },
  secBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceContainerHighest,
  },
  secBtnText: {
    fontFamily: 'DMSans_500Medium',
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  primaryBtnText: {
    color: theme.colors.surface,
    fontFamily: 'DMSans_500Medium',
  }
});
