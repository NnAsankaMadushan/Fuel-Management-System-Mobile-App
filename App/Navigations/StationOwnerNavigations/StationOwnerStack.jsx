import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OperatorsScreen from '../../Screens/StationOwnerScreens/OperatorsScreen';
import StationLogsScreen from '../../Screens/SharedScreens/StationLogsScreen';
import StationOwnerTabs from './StationOwnerTabs';

const Stack = createStackNavigator();

const StationOwnerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="stationOwnerTabs" component={StationOwnerTabs} />
    <Stack.Screen name="stationOperators" component={OperatorsScreen} />
    <Stack.Screen name="stationLogs" component={StationLogsScreen} />
  </Stack.Navigator>
);

export default StationOwnerStack;
