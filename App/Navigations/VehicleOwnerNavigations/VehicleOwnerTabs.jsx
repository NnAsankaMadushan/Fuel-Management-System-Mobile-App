import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AppTheme } from '../../../constants/Colors';

import HomeScreen from '../../Screens/VehicleOwnerScreens/HomeScreen';
import ProfileScreen from '../../Screens/VehicleOwnerScreens/ProfileScreen';
import VehicleRegisterScreen from '../../Screens/VehicleOwnerScreens/VehicleRegisterScreen';
import VehicleQrScreen from '../../Screens/VehicleOwnerScreens/VehicleQrScreen';
import VehicleQuotaScreen from '../../Screens/VehicleOwnerScreens/VehicleQuotaScreen';

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

const VehicleOwnerTabs = () => (
  <Tab.Navigator screenOptions={screenOptions}>
    <Tab.Screen
      name="vehicleHome"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="vehicleRegister"
      component={VehicleRegisterScreen}
      options={{
        tabBarLabel: 'Register',
        tabBarIcon: ({ color, size }) => <FontAwesome name="plus-circle" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="vehicleQr"
      component={VehicleQrScreen}
      options={{
        tabBarLabel: 'Vehicle',
        tabBarIcon: ({ color, size }) => <FontAwesome name="qrcode" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="vehicleQuota"
      component={VehicleQuotaScreen}
      options={{
        tabBarLabel: 'Quota',
        tabBarIcon: ({ color, size }) => <FontAwesome name="tint" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="vehicleProfile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <FontAwesome name="user" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

export default VehicleOwnerTabs;
