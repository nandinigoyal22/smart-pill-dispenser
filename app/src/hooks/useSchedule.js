import { useState, useEffect, useRef } from 'react';
import { writePin } from '../services/blynk';
import { useHistory } from './useHistory';

// Start empty as requested!
let mockScheduleDB = [];

export function useSchedule(deviceId = 'pill_dispenser_01') {
  const [localSchedule, setLocalSchedule] = useState(mockScheduleDB);
  const triggeredSlots = useRef(new Set());
  const { addHistoryEvent } = useHistory();

  // 🔥 CORE ARCHITECTURE FIX: Link Schedule to ESP32 Hardware
  useEffect(() => {
    const timer = setInterval(() => {
      if (!mockScheduleDB || mockScheduleDB.length === 0) return;

      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;

      const strTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      const timeKey = `${now.getMonth()}-${now.getDate()}-${strTime}`; // Daily anti-spam key

      mockScheduleDB.forEach(async (slot) => {
        if (slot.enabled && slot.time === strTime) {
          const slotKey = `${slot.id}-${timeKey}`;

          if (!triggeredSlots.current.has(slotKey)) {
            console.log(`[SCHEDULE HIT] Time for ${slot.med}! Sending command to ESP32...`);
            triggeredSlots.current.add(slotKey);

            // 🔥 ACTUATE HARDWARE
            await writePin('V3', 1);
            
            // Add to Notification Center Log natively!
            addHistoryEvent({
              type: 'Reminder',
              med_name: slot.med,
              scheduled_time: slot.time
            });

            setTimeout(() => writePin('V3', 0), 500);
          }
        }
      });
    }, 10000); // Check every 10 sec to guarantee we catch the minute wrap

    return () => clearInterval(timer);
  }, []);

  const addSlot = (time, med_name) => {
    const newSlot = {
      id: Date.now().toString(),
      time,
      med: med_name,
      enabled: true
    };
    const updated = [...localSchedule, newSlot];
    setLocalSchedule(updated);
    mockScheduleDB = updated;
  };

  const updateSlot = (id, { time, med_name, enabled }) => {
    const updated = localSchedule.map(slot =>
      slot.id === id ? { ...slot, time, med: med_name, enabled } : slot
    );
    setLocalSchedule(updated);
    mockScheduleDB = updated;
  };

  const removeSlot = (id) => {
    const updated = localSchedule.filter(slot => slot.id !== id);
    setLocalSchedule(updated);
    mockScheduleDB = updated;
  };

  const saveSchedule = async () => {
    console.log("Mock saved schedule:", localSchedule);
  };

  const getNextDose = () => {
    if (!mockScheduleDB || mockScheduleDB.length === 0) return null;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let nextSlot = null;
    let minDiff = 24 * 60; // max valid difference

    mockScheduleDB.forEach(slot => {
      if (slot.enabled && slot.time) {
        // time is stored as "hh:mm AM/PM"
        const [timePart, modifier] = slot.time.split(' ');
        let [h, m] = timePart.split(':').map(Number);

        if (h === 12) h = (modifier === 'PM') ? 12 : 0;
        else if (modifier === 'PM') h += 12;

        const slotMins = h * 60 + m;

        let diff = slotMins - currentMins;
        if (diff <= 0) diff += 24 * 60; // Next day

        if (diff < minDiff) {
          minDiff = diff;
          nextSlot = { ...slot };
        }
      }
    });

    return nextSlot;
  };

  return { localSchedule, addSlot, updateSlot, removeSlot, saveSchedule, getNextDose };
}
