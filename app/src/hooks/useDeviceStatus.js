import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../services/firebase';

export function useDeviceStatus(deviceId = 'pill_dispenser_01') {
  const [statusParams, setStatusParams] = useState({
    online: false,
    uptime: '0m',
    wifiRSSI: 0,
    wifiLabel: 'Unknown',
    firmwareVersion: '',
    lastDispense: '',
    servoHealth: '',
    lidOpen: false,
    containerEmpty: false,
    currentState: '',
    isStale: false,
  });

  const computeUptimeString = (seconds) => {
    if (!seconds) return '0m';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m}m`;
  };

  const getWifiStrengthLabel = (rssi) => {
    if (rssi >= -50) return 'Excellent';
    if (rssi >= -60) return 'Good';
    if (rssi >= -70) return 'Fair';
    return 'Weak';
  };

  const isDeviceStale = (last_seen) => {
    if (!last_seen) return true;
    const lastSeenTime = new Date(last_seen).getTime();
    const now = Date.now();
    return (now - lastSeenTime) > 15 * 60 * 1000; // 15 mins
  };

  useEffect(() => {
    const statusRef = ref(database, `devices/${deviceId}/device_status`);

    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStatusParams({
          online: data.online,
          uptime: computeUptimeString(data.uptime_seconds),
          wifiRSSI: data.wifi_rssi,
          wifiLabel: getWifiStrengthLabel(data.wifi_rssi),
          firmwareVersion: data.firmware_version,
          lastDispense: data.last_dispense,
          servoHealth: data.servo_health,
          lidOpen: data.lid_open,
          containerEmpty: data.container_empty,
          currentState: data.current_state,
          isStale: isDeviceStale(data.last_seen),
        });
      }
    });

    return () => {
      off(statusRef);
    };
  }, [deviceId]);

  return statusParams;
}
