import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AppTheme } from '../../../constants/Colors';

import HomeScreen from '../../Screens/OperatorScreens/HomeScreen';
import StationFuelSummaryScreen from '../../Screens/SharedScreens/StationFuelSummaryScreen';
import StationLogsScreen from '../../Screens/SharedScreens/StationLogsScreen';

const Tab = createBottomTabNavigator();

const screenOptions = {
  headerShown: false,
  tabBarActiveTintColor: AppTheme.tabBar.activeTintColor,
  tabBarInactiveTintColor: AppTheme.tabBar.inactiveTintColor,
  tabBarStyle: {
    backgroundColor: AppTheme.tabBar.backgroundColor,
    borderTopColor: AppTheme.tabBar.borderTopColor,
    height: 72,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '700',
  },
};

const OperatorTabs = () => (
  <Tab.Navigator screenOptions={screenOptions}>
    <Tab.Screen
      name="operatorFuelSummary"
      component={StationFuelSummaryScreen}
      options={{
        tabBarLabel: 'Fuel',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="gas-station-outline" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="operatorLogs"
      component={StationLogsScreen}
      options={{
        tabBarLabel: 'Logs',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="history" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="operatorScanner"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Scan',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

export default OperatorTabs;
