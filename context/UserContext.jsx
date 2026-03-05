import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildApiUrl, buildMobileRequestConfig } from '../utils/apiConfig';
import { normalizeUserPayload } from '../utils/userRole';

// import AdminTabs from '../App/Navigations/AdminNavigations/AdminTabs';
// import VehicleOwnerTabs from '../App/Navigations/VehicleOwnerNavigations/VehicleOwnerTabs';
// import StationOwnerTabs from '../App/Navigations/StationOwnerNavigations/StationOwnerTabs';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in
    const checkUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const normalizedUser = normalizeUserPayload(JSON.parse(userData));
        setUser(normalizedUser);
        await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
        // navigateToRoleBasedScreen(JSON.parse(userData).role);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const loginUser = async (email, password) => {
    try {
      const response = await axios.post(
        buildApiUrl('/api/users/login'),
        { email, password },
        buildMobileRequestConfig(),
      );
      const userData = normalizeUserPayload(response.data);

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signupUser = async (name, email, password, role, phoneNumber, nicNumber) => {
    try {
      const response = await axios.post(
        buildApiUrl('/api/users/signup'),
        { name, email, password, role, phoneNumber, nicNumber },
        buildMobileRequestConfig(),
      );
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const resendSignupOtp = async (email) => {
    try {
      const response = await axios.post(
        buildApiUrl('/api/users/signup/resend-otp'),
        { email },
        buildMobileRequestConfig(),
      );
      return response.data;
    } catch (error) {
      console.error('Resend signup OTP error:', error);
      throw error;
    }
  };

  const confirmSignupUser = async (email, otp) => {
    try {
      const response = await axios.post(
        buildApiUrl('/api/users/signup/confirm'),
        { email, otp },
        buildMobileRequestConfig(),
      );
      return response.data;
    } catch (error) {
      console.error('Confirm signup OTP error:', error);
      throw error;
    }
  };

  const requestEmailVerificationOtp = async (email) => {
    try {
      const response = await axios.post(
        buildApiUrl('/api/users/email-verification/request-otp'),
        { email },
        buildMobileRequestConfig(),
      );
      return response.data;
    } catch (error) {
      console.error('Request email OTP error:', error);
      throw error;
    }
  };

  const verifyEmailVerificationOtp = async (email, otp) => {
    try {
      const response = await axios.post(
        buildApiUrl('/api/users/email-verification/verify-otp'),
        { email, otp },
        buildMobileRequestConfig(),
      );
      return response.data;
    } catch (error) {
      console.error('Verify email OTP error:', error);
      throw error;
    }
  };

  const logoutUser = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user?.token) {
      throw new Error('You need to log in first.');
    }

    const response = await axios.put(
      buildApiUrl('/api/users/change-password'),
      { currentPassword, newPassword },
      buildMobileRequestConfig(user),
    );

    const updatedUser = normalizeUserPayload({
      ...user,
      ...(response.data?.user || {}),
      token: user.token,
    });

    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    return response.data;
  };

  // const navigateToRoleBasedScreen = (role) => {
  // if (role === 'vehicle_owner') {
  //   navigation.navigate('VehicleOwnerTabs');
  // } else if (role === 'station_owner') {
  //   navigation.navigate('StationOwnerTabs');
  // } else if (role === 'admin') {
  //   navigation.navigate('AdminTabs');
  // }
  // if (role === 'vehicle_owner') {
  //   navigation.navigate(VehicleOwnerTabs);
  // } else if (role === 'station_owner') {
  //   navigation.navigate(StationOwnerTabs);
  // } else if (role === 'admin') {
  //   navigation.navigate(AdminTabs);
  // }
  // };

  const updateUser = (updatedUser) => {
    const mergedUser = normalizeUserPayload({ ...user, ...updatedUser });
    setUser(mergedUser);
    AsyncStorage.setItem('user', JSON.stringify(mergedUser));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loginUser,
        signupUser,
        resendSignupOtp,
        confirmSignupUser,
        requestEmailVerificationOtp,
        verifyEmailVerificationOtp,
        logoutUser,
        updateUser,
        changePassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
