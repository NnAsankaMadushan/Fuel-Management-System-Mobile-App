import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VehicleOwnerTabs from './VehicleOwnerTabs';
import VehicleDetailsScreen from '../../Screens/VehicleOwnerScreens/VehicleDetailsScreen';
import VehicleLogsScreen from '../../Screens/VehicleOwnerScreens/VehicleLogsScreen';

const Stack = createStackNavigator();

const VehicleOwnerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="vehicleTabs" component={VehicleOwnerTabs} />
    <Stack.Screen name="vehicleLogs" component={VehicleLogsScreen} />
    <Stack.Screen name="vehicleDetails" component={VehicleDetailsScreen} />
  </Stack.Navigator>
);

export default VehicleOwnerStack;
