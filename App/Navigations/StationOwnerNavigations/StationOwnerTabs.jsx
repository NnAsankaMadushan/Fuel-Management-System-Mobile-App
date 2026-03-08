import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import HomeScreen from '../../Screens/StationOwnerScreens/HomeScreen';
import ProfileScreen from '../../Screens/StationOwnerScreens/ProfileScreen';
import StationFuelSummaryScreen from '../../Screens/SharedScreens/StationFuelSummaryScreen';
import NotificationCenterScreen from '../../Screens/SharedScreens/NotificationCenterScreen';
import { tabScreenOptions } from '../sharedTabScreenOptions';

const Tab = createBottomTabNavigator();

const StationOwnerTabs = () => (
  <Tab.Navigator screenOptions={tabScreenOptions}>
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
      name="stationNotifications"
      component={NotificationCenterScreen}
      options={{
        tabBarLabel: 'Alerts',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="bell-badge-outline" size={size} color={color} />,
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
