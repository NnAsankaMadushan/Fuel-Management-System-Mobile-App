import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import AppButton from '../../Components/UI/AppButton';
import AppInput from '../../Components/UI/AppInput';
import AppSelect from '../../Components/UI/AppSelect';
import ScreenShell from '../../Components/UI/ScreenShell';

const { colors, spacing, radius, shadow } = AppTheme;

const VEHICLE_TYPE_OPTIONS = [
  { label: 'Car', value: 'car' },
  { label: 'Motorcycle', value: 'bike' },
  { label: 'Truck', value: 'truck' },
  { label: 'Bus', value: 'bus' },
];

const FUEL_TYPE_OPTIONS = [
  { label: 'Petrol', value: 'petrol' },
  { label: 'Diesel', value: 'diesel' },
];

const formatVehicleNumberInput = (value) =>
  value.toUpperCase().replace(/[^A-Z0-9 -]/g, '').replace(/\s+/g, ' ').trimStart();

const VehicleRegisterScreen = ({ navigation }) => {
  const { user, updateUser } = useUser();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [registryDetails, setRegistryDetails] = useState({
    engineNumber: '',
    chassisNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleRegistryDetailChange = (field, value) => {
    setRegistryDetails((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    const formattedVehicleNumber = vehicleNumber.trim();

    if (!formattedVehicleNumber || !vehicleType || !fuelType) {
      setIsError(true);
      setResponseMessage('Vehicle number, vehicle type, and fuel type are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setIsError(false);
      setResponseMessage('');

      const response = await axios.post(
        buildApiUrl('/api/vehicles/register'),
        {
          vehicleNumber: formattedVehicleNumber,
          vehicleType,
          fuelType,
          ...registryDetails,
        },
        buildMobileRequestConfig(user),
      );

      const { message, ...registeredVehicle } = response.data;
      updateUser({
        vehicles: [...(user?.vehicles || []), registeredVehicle],
      });

      setVehicleNumber('');
      setVehicleType('');
      setFuelType('');
      setRegistryDetails({
        engineNumber: '',
        chassisNumber: '',
      });
      setResponseMessage(message || 'Vehicle registered successfully. Redirecting to your dashboard...');

      globalThis.setTimeout(() => {
        navigation.navigate(user?.role === 'station_operator' ? 'operatorScanner' : 'vehicleHome');
      }, 1200);
    } catch (error) {
      setIsError(true);
      setResponseMessage(error.response?.data?.message || 'Error registering vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell
      badge="Register"
      title="Register vehicle"
      subtitle="Add the vehicle number, type, and fuel."
    >
      <View style={styles.formCard}>
        <AppInput
          label="Vehicle number"
          placeholder="ABC 1234"
          value={vehicleNumber}
          onChangeText={(value) => setVehicleNumber(formatVehicleNumberInput(value))}
          autoCapitalize="characters"
        />
        <AppSelect
          label="Vehicle type"
          options={VEHICLE_TYPE_OPTIONS}
          selectedValue={vehicleType}
          onValueChange={setVehicleType}
          placeholder="Select vehicle type"
        />
        <AppSelect
          label="Fuel type"
          options={FUEL_TYPE_OPTIONS}
          selectedValue={fuelType}
          onValueChange={setFuelType}
          placeholder="Select fuel type"
        />

        <View style={styles.registryCard}>
          <Text style={styles.registryTitle}>Additional registry details</Text>
          <Text style={styles.registryText}>
            Only fill these if the vehicle number is not already in the registry.
          </Text>

          <AppInput
            label="Engine number"
            placeholder="ENG-NC8899-2017"
            value={registryDetails.engineNumber}
            onChangeText={(value) => handleRegistryDetailChange('engineNumber', value)}
            autoCapitalize="characters"
          />
          <AppInput
            label="Chassis number"
            placeholder="CHS-NC8899-2017"
            value={registryDetails.chassisNumber}
            onChangeText={(value) => handleRegistryDetailChange('chassisNumber', value)}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.buttonStack}>
          <AppButton title="Register Vehicle" onPress={handleRegister} loading={isSubmitting} />
        </View>

        {responseMessage ? (
          <View style={[styles.responseCard, isError ? styles.errorCard : styles.successCard]}>
            <Text style={[styles.responseText, isError ? styles.errorText : styles.successText]}>
              {responseMessage}
            </Text>
          </View>
        ) : null}
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  formCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.md,
  },
  buttonStack: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  registryCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  registryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  registryText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  responseCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  successCard: {
    backgroundColor: colors.successSoft,
  },
  errorCard: {
    backgroundColor: colors.dangerSoft,
  },
  responseText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
  },
  successText: {
    color: colors.success,
  },
  errorText: {
    color: colors.danger,
  },
});

export default VehicleRegisterScreen;
