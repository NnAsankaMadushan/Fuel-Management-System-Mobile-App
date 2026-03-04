// src/navigation/MainNavigation.js
import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
import AuthNavigation from './AuthNavigation';
import VehicleOwnerStack from '../VehicleOwnerNavigations/VehicleOwnerStack';
import StationOwnerTabs from '../StationOwnerNavigations/StationOwnerTabs';
import OperatorTabs from '../OperatorNavigations/OperatorTabs';
import AdminTabs from '../AdminNavigations/AdminTabs';
import { useUser } from '../../../context/UserContext';

const MainNavigation = () => {
  const { user } = useUser();

  return (
    <>
      {user
        ? user.role === 'vehicle_owner'
          ? <VehicleOwnerStack />
          : user.role === 'station_owner'
            ? <StationOwnerTabs />
            : user.role === 'station_operator'
              ? <OperatorTabs />
              : user.role === 'admin'
                ? <AdminTabs />
                : <AuthNavigation />
        : <AuthNavigation />}
    </>
  );
};

export default MainNavigation;
