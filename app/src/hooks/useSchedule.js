import { useState, useEffect } from 'react';
import { ref, update, get } from 'firebase/database';
import { database } from '../services/firebase';

export function useSchedule(deviceId = 'pill_dispenser_01') {
  const [localSchedule, setLocalSchedule] = useState({});

  // Fetch initial schedule
  useEffect(() => {
    const fetchSched = async () => {
      const snapshot = await get(ref(database, `devices/${deviceId}/schedule`));
      if (snapshot.exists()) {
        setLocalSchedule(snapshot.val());
      }
    };
    fetchSched();
  }, [deviceId]);

  const updateSlot = (index, { time, med_name, enabled }) => {
    setLocalSchedule(prev => ({
      ...prev,
      [`slot_${index}`]: {
        time,
        med: med_name,
        enabled
      }
    }));
  };

  const saveSchedule = async () => {
    try {
      // Write to Firebase
      const schedRef = ref(database, `devices/${deviceId}/schedule`);
      await update(schedRef, localSchedule);
      // Firebase Cloud Function 'scheduleUpdated' will handle triggering ESP32 sync via pending_sync flag
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
  };

  const getNextDose = () => {
    if (!localSchedule) return null;
    
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    let nextSlot = null;
    let minDiff = 24 * 60; // max valid difference

    Object.keys(localSchedule).forEach(key => {
      const slot = localSchedule[key];
      if (slot.enabled && slot.time) {
        const [h, m] = slot.time.split(':').map(Number);
        const slotMins = h * 60 + m;
        
        let diff = slotMins - currentMins;
        if (diff <= 0) diff += 24 * 60; // Next day
        
        if (diff < minDiff) {
          minDiff = diff;
          nextSlot = { ...slot, id: key };
        }
      }
    });
    
    return nextSlot; // returns { time, med, enabled, id }
  };

  return { localSchedule, updateSlot, saveSchedule, getNextDose };
}
