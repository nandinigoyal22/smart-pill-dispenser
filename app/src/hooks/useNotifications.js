import { useState, useEffect } from 'react';

// Fully mocked to avoid Expo Go SDK 53 crash with expo-notifications
export function useNotifications(deviceId = 'pill_dispenser_01') {
  const [expoPushToken, setExpoPushToken] = useState('mock-push-token-123');

  useEffect(() => {
    // Mock registration success
    console.log("Mock push notifications registered.");
  }, []);

  return { expoPushToken };
}
