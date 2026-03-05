import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Login from '../../Screens/AuthScreens/Login';
import SignUp from '../../Screens/AuthScreens/SignUp';
import VerifyEmail from '../../Screens/AuthScreens/VerifyEmail';

const Stack = createStackNavigator();

const AuthNavigation = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Signup" component={SignUp} />
    <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
  </Stack.Navigator>
);

export default AuthNavigation;
