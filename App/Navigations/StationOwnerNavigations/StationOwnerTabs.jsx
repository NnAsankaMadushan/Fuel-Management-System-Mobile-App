import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AppTheme } from '../../../constants/Colors';

import HomeScreen from '../../Screens/StationOwnerScreens/HomeScreen';
import OperatorsScreen from '../../Screens/StationOwnerScreens/OperatorsScreen';
import ProfileScreen from '../../Screens/StationOwnerScreens/ProfileScreen';
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

const StationOwnerTabs = () => (
  <Tab.Navigator screenOptions={screenOptions}>
    <Tab.Screen
      name="stationHome"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="stationFuelSummary"
      component={StationFuelSummaryScreen}
      options={{
        tabBarLabel: 'Fuel',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="gas-station-outline" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="stationLogs"
      component={StationLogsScreen}
      options={{
        tabBarLabel: 'Logs',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="history" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="stationOperators"
      component={OperatorsScreen}
      options={{
        tabBarLabel: 'Operators',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="stationProfile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <FontAwesome name="user" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

export default StationOwnerTabs;
