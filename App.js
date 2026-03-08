// App.js
import React, { useEffect, useRef } from 'react';
import MainNavigation from './App/Navigations/AuthNavigations/MainNavigation';
import { useUser, UserProvider } from './context/UserContext';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AppTheme } from './constants/Colors';
import { ensureDeviceNotificationAccess } from './utils/deviceNotifications';
import { persistExpoNotificationLocally } from './utils/notificationSync';
import { setNativeAlertFallback, showThemedAlert } from './utils/themedAlertBridge';
import { ThemedAlertProvider } from './context/ThemedAlertContext';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: AppTheme.colors.canvas,
    card: AppTheme.colors.surface,
    text: AppTheme.colors.text,
    border: 'rgba(24, 33, 47, 0.08)',
    primary: AppTheme.colors.accent,
  },
};

const NotificationPersistenceBridge = () => {
  const { user } = useUser();
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const persistIncomingNotification = async (notification) => {
      if (!notification) {
        return;
      }

      try {
        await persistExpoNotificationLocally(userRef.current, notification);
      } catch (error) {
        console.error('Failed to persist incoming notification locally:', error);
      }
    };

    const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
      persistIncomingNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      persistIncomingNotification(response?.notification);
    });

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response?.notification) {
          return persistIncomingNotification(response.notification);
        }

        return null;
      })
      .catch((error) => {
        console.error('Failed to read last notification response:', error);
      });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, []);

  return null;
};

export default function App() {
  useEffect(() => {
    const originalAlert = Alert.alert.bind(Alert);
    setNativeAlertFallback(originalAlert);
    Alert.alert = showThemedAlert;

    return () => {
      Alert.alert = originalAlert;
      setNativeAlertFallback(null);
    };
  }, []);

  useEffect(() => {
    ensureDeviceNotificationAccess().catch((error) => {
      console.error('Failed to initialize device notifications:', error);
    });
  }, []);

  return (
    <ThemedAlertProvider>
      <NavigationContainer theme={navigationTheme}>
        <UserProvider>
          <NotificationPersistenceBridge />
          <MainNavigation />
        </UserProvider>
      </NavigationContainer>
    </ThemedAlertProvider>
  );
}
