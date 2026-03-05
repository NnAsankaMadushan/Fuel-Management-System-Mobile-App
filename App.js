// App.js
import React from 'react';
import MainNavigation from './App/Navigations/AuthNavigations/MainNavigation';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { AppTheme } from './constants/Colors';

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

export default function App() {
  return (
    <ToastProvider>
      <NavigationContainer theme={navigationTheme}>
        <UserProvider>
          <MainNavigation />
        </UserProvider>
      </NavigationContainer>
    </ToastProvider>
  );
}
