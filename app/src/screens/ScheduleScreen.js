import React, { useState } from 'react';
import { View, ScrollView, Switch, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSchedule } from '../hooks/useSchedule';
import { theme } from '../theme/AnalogPrecisionist';
import { ContainerCard } from '../components/Cards';
import { Headline, Body, Technical } from '../components/Typography';

export default function ScheduleScreen() {
  const { localSchedule, addSlot, updateSlot, removeSlot, saveSchedule } = useSchedule();
  
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [newMedName, setNewMedName] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) {
      setDateObj(selectedDate);
      
      let hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // 0 becomes 12
      
      const strTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      setNewTime(strTime);
    }
  };

  const syncToDevice = async () => {
    await saveSchedule();
    alert("Saved offline to the device!");
  };

  const handleAddNew = () => {
    if (newTime && newMedName) {
      addSlot(newTime, newMedName);
      setNewTime('');
      setNewMedName('');
      setIsAddingMode(false);
    } else {
      alert("Please enter both Time and Medication Name!");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Headline style={styles.title}>Prescription Config</Headline>
      
      {localSchedule.length === 0 && !isAddingMode && (
        <Body style={styles.emptyPrompt}>No medicines scheduled yet. Add one below!</Body>
      )}

      {localSchedule.map((slot) => (
        <ContainerCard key={slot.id}>
             <View style={styles.slotRow}>
               <View style={{flex: 1}}>
                 <Technical>{slot.time}</Technical>
                 <Body style={styles.medLabel}>{slot.med}</Body>
               </View>
               <Switch 
                 value={slot.enabled} 
                 onValueChange={(val) => updateSlot(slot.id, { time: slot.time, med_name: slot.med, enabled: val })}
                 trackColor={{ false: theme.colors.surfaceDim, true: theme.colors.secondaryContainer }}
                 thumbColor={slot.enabled ? theme.colors.secondary : theme.colors.outlineVariant}
               />
               <TouchableOpacity onPress={() => removeSlot(slot.id)} style={styles.editWrap}>
                 <Body style={{color: theme.colors.error, fontFamily: 'DMSans_500Medium'}}>Remove</Body>
               </TouchableOpacity>
             </View>
        </ContainerCard>
      ))}

      {isAddingMode ? (
        <ContainerCard>
          <TouchableOpacity 
            style={styles.inputDropdown} 
            onPress={() => setShowPicker(true)}
          >
            <Body style={{color: newTime ? theme.colors.primary : theme.colors.outlineVariant}}>
              {newTime || "Select Time (Dropdown) ▼"}
            </Body>
          </TouchableOpacity>
          
          {showPicker && (
            <DateTimePicker
              value={dateObj}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          <TextInput 
            style={styles.input}
            placeholder="Medication Name"  
            placeholderTextColor={theme.colors.outlineVariant}
            value={newMedName}
            onChangeText={setNewMedName}
          />
          <View style={{flexDirection: 'row', gap: 10}}>
            <TouchableOpacity style={styles.secBtn} onPress={handleAddNew}>
              <Body style={styles.secBtnText}>Save Medicine</Body>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secBtn, {backgroundColor: 'transparent'}]} onPress={() => setIsAddingMode(false)}>
              <Body style={[styles.secBtnText, {color: theme.colors.outline}]}>Cancel</Body>
            </TouchableOpacity>
          </View>
        </ContainerCard>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsAddingMode(true)} activeOpacity={0.8}>
          <Body style={styles.addBtnText}>+ Add New Medicine</Body>
        </TouchableOpacity>
      )}

      {localSchedule.length > 0 && (
        <TouchableOpacity style={styles.primaryBtn} onPress={syncToDevice} activeOpacity={0.8}>
          <Body style={styles.primaryBtnText}>Commit to Hardware</Body>
        </TouchableOpacity>
      )}
      
      <View style={{height: 40}}/>
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
  title: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  emptyPrompt: {
    color: theme.colors.outlineVariant,
    marginBottom: theme.spacing.xl,
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
  input: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    paddingVertical: 12,
    marginBottom: 16,
    color: theme.colors.primary,
  },
  inputDropdown: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    paddingVertical: 12,
    marginBottom: 16,
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
  addBtn: {
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: theme.radii.lg,
    height: 56,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  addBtnText: {
    color: theme.colors.primary,
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
