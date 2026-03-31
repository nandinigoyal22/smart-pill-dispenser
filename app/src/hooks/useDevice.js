import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../services/firebase';

export function useDevice(deviceId = 'pill_dispenser_01') {
  const [schedule, setSchedule] = useState({});
  const [lastEvent, setLastEvent] = useState(null);
  const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0, pill_level_pct: 0 });
  const [deviceStatus, setDeviceStatus] = useState({});
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const deviceRef = ref(database, `devices/${deviceId}`);

    // Real-time listener on /devices/pill_dispenser_01
    onValue(deviceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.schedule) setSchedule(data.schedule);
        if (data.last_event) setLastEvent(data.last_event);
        if (data.sensor_data) setSensorData(data.sensor_data);
        if (data.device_status) {
          setDeviceStatus(data.device_status);
          setIsOnline(data.device_status.online === true);
        }
      }
    });

    return () => {
      off(deviceRef);
    };
  }, [deviceId]);

  return { schedule, lastEvent, sensorData, deviceStatus, isOnline };
}
