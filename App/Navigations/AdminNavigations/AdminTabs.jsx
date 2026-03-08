import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import VehiclesScreen from '../../Screens/AdminScreens/VehiclesScreen';
import ProfileScreen from '../../Screens/AdminScreens/ProfileScreen';
import StationScreen from '../../Screens/AdminScreens/StationScreen';
import { tabScreenOptions } from '../sharedTabScreenOptions';

const Tab = createBottomTabNavigator();

const AdminTabs = () => (
  <Tab.Navigator screenOptions={tabScreenOptions}>
    <Tab.Screen
      name="adminVehicles"
      component={VehiclesScreen}
      options={{
        tabBarLabel: 'Vehicles',
        tabBarIcon: ({ color, size }) => <FontAwesome5 name="car" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="adminStations"
      component={StationScreen}
      options={{
        tabBarLabel: 'Stations',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="fuel" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="adminProfile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <FontAwesome name="user" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

export default AdminTabs;
