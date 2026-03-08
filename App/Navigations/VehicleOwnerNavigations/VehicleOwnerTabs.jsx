import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import HomeScreen from '../../Screens/VehicleOwnerScreens/HomeScreen';
import ProfileScreen from '../../Screens/VehicleOwnerScreens/ProfileScreen';
import VehicleRegisterScreen from '../../Screens/VehicleOwnerScreens/VehicleRegisterScreen';
import VehicleQrScreen from '../../Screens/VehicleOwnerScreens/VehicleQrScreen';
import NotificationCenterScreen from '../../Screens/SharedScreens/NotificationCenterScreen';
import { tabScreenOptions } from '../sharedTabScreenOptions';

const Tab = createBottomTabNavigator();

const VehicleOwnerTabs = () => (
  <Tab.Navigator screenOptions={tabScreenOptions}>
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
      name="vehicleProfile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <FontAwesome name="user" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="vehicleNotifications"
      component={NotificationCenterScreen}
      options={{
        tabBarLabel: 'Alerts',
        tabBarIcon: ({ color, size }) => <FontAwesome name="bell-o" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

export default VehicleOwnerTabs;
