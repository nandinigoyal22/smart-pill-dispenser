import { useState, useEffect, useRef } from 'react';
import { readPin } from '../services/blynk';
import { useHistory } from './useHistory';

export function useDeviceStatus(deviceId = 'pill_dispenser_01') {
  const [statusParams, setStatusParams] = useState({
    online: false,
    lidOpen: false,
    irDetected: false,
    containerEmpty: false,
    currentState: 'Connecting...',
    isStale: true,
  });

  const lastLoggedStatus = useRef("");
  const { addHistoryEvent } = useHistory();

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      const [v2, v5, v6] = await Promise.all([
        readPin('V2'), // Status Priority String
        readPin('V5'), // Lid Open
        readPin('V6')  // IR Detection
      ]);

      if (isMounted) {
        setStatusParams(prev => {
          const parsedLidOpen = v5 !== null ? (Number(v5) === 1) : prev.lidOpen;
          const parsedIrDetected = v6 !== null ? (Number(v6) === 1) : prev.irDetected;

          let determinedState = prev.currentState;

          if (!v2 || v2 === "") {
            if (parsedLidOpen) {
              determinedState = "BOX OPEN";
            } else if (parsedIrDetected) {
              determinedState = "PILL DETECTED";
            } else {
              determinedState = "SYNCING...";
            }
          } else {
            determinedState = v2;
          }

          // 🔥 ADD TO HISTORY LOGIC (Event Driven)
          if (
            determinedState !== lastLoggedStatus.current &&
            determinedState !== "SYNCING..." &&
            determinedState !== "Connecting..."
          ) {
            if (determinedState !== "SYSTEM NORMAL") {
              addHistoryEvent({
                type: 'Hardware Alert',
                med_name: determinedState,
                scheduled_time: 'N/A',
              });
            }
            lastLoggedStatus.current = determinedState;
          }

          return {
            ...prev,
            online: v2 !== null || prev.online, // Keep online if we have any data (live or prev)
            isStale: v2 === null && prev.isStale, // Only stale if persistent failure
            currentState: determinedState,
            lidOpen: parsedLidOpen,
            irDetected: parsedIrDetected,
            containerEmpty: v2 === "LOW MEDICINE",
          };
        });
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [deviceId]);

  return statusParams;
}
