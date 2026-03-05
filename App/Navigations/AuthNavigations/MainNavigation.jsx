// src/navigation/MainNavigation.js
import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
import AuthNavigation from './AuthNavigation';
import VehicleOwnerStack from '../VehicleOwnerNavigations/VehicleOwnerStack';
import StationOwnerTabs from '../StationOwnerNavigations/StationOwnerTabs';
import OperatorTabs from '../OperatorNavigations/OperatorTabs';
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
    return <StationOwnerTabs />;
  }

  if (user.role === 'station_operator') {
    return <OperatorTabs />;
  }

  if (user.role === 'admin') {
    return <AdminTabs />;
  }

  return <AuthNavigation />;
};

export default MainNavigation;
