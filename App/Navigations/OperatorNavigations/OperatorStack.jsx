import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StationLogsScreen from '../../Screens/SharedScreens/StationLogsScreen';
import VehicleRegisterScreen from '../../Screens/VehicleOwnerScreens/VehicleRegisterScreen';
import OperatorTabs from './OperatorTabs';

const Stack = createStackNavigator();

const OperatorStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="operatorTabs" component={OperatorTabs} />
    <Stack.Screen name="operatorLogs" component={StationLogsScreen} />
    <Stack.Screen name="operatorVehicleRegister" component={VehicleRegisterScreen} />
  </Stack.Navigator>
);

export default OperatorStack;
