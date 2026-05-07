import { useState, useEffect } from 'react';
import { readPin } from '../services/blynk';

export function useDevice(deviceId = 'pill_dispenser_01') {
  const [sensorData, setSensorData] = useState({ temperature: '--', humidity: '--', pill_level_pct: '--' });

  useEffect(() => {
    let isMounted = true;
    
    const fetchSensors = async () => {
      // Grouping logic: fetch concurrently to reduce lag
      const [tempRes, humRes, loadRes] = await Promise.all([
        readPin('V0'),
        readPin('V1'),
        readPin('V4')
      ]);

      if (isMounted) {
        setSensorData(prev => ({
          ...prev,
          temperature: (tempRes !== null && tempRes !== undefined) ? Number(tempRes).toFixed(1) : prev.temperature,
          humidity: (humRes !== null && humRes !== undefined) ? Number(humRes).toFixed(0) : prev.humidity,
          pill_level_pct: (loadRes !== null && loadRes !== undefined) ? Number(loadRes) : prev.pill_level_pct
        }));
      }
    };

    fetchSensors(); // Initial fetch
    const interval = setInterval(fetchSensors, 3000); // 3-second polling

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [deviceId]);

  return { sensorData, lastEvent: null }; // Removed lastEvent mock since History handles it
}
