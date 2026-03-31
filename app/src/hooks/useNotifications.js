import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ref, set } from 'firebase/database';
import { database } from '../services/firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications(deviceId = 'pill_dispenser_01') {
  const [expoPushToken, setExpoPushToken] = useState('');

  const registerForPushNotifications = async () => {
    let token;
    
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Get token
    token = (await Notifications.getExpoPushTokenAsync()).data;
    setExpoPushToken(token);

    // Save token to Firebase connected to the device
    if (token) {
      const tokenRef = ref(database, `device_users/${deviceId}/caregiver_token`);
      set(tokenRef, token);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  const handleForegroundNotification = (notification) => {
    console.log("Foreground notification received:", notification);
  };

  const handleBackgroundNotification = (response) => {
    console.log("Background notification tapped:", response);
  };

  useEffect(() => {
    registerForPushNotifications();

    const foregroundSub = Notifications.addNotificationReceivedListener(handleForegroundNotification);
    const backgroundSub = Notifications.addNotificationResponseReceivedListener(handleBackgroundNotification);

    return () => {
      foregroundSub.remove();
      backgroundSub.remove();
    };
  }, []);

  return { expoPushToken };
}
