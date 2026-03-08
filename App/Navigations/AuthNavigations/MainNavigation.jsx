// src/navigation/MainNavigation.js
import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
import AuthNavigation from './AuthNavigation';
import VehicleOwnerStack from '../VehicleOwnerNavigations/VehicleOwnerStack';
import StationOwnerStack from '../StationOwnerNavigations/StationOwnerStack';
import OperatorStack from '../OperatorNavigations/OperatorStack';
import AdminTabs from '../AdminNavigations/AdminTabs';
import ChangePasswordScreen from '../../Screens/SharedScreens/ChangePasswordScreen';
import { useUser } from '../../../context/UserContext';

const MainNavigation = () => {
  const { user } = useUser();

  if (!user) {
    return <AuthNavigation />;
  }

  if (user.mustChangePassword) {
    return <ChangePasswordScreen isMandatory />;
  }

  if (user.role === 'vehicle_owner') {
    return <VehicleOwnerStack />;
  }

  if (user.role === 'station_owner') {
    return <StationOwnerStack />;
  }

  if (user.role === 'station_operator') {
    return <OperatorStack />;
  }

  if (user.role === 'admin') {
    return <AdminTabs />;
  }

  return <AuthNavigation />;
};

export default MainNavigation;
