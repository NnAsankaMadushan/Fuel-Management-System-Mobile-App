import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { useAppToast } from '../../../context/ToastContext';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import { showUnreadNotificationPopup } from '../../../utils/notificationPopup';
import ActionCard from '../../Components/UI/ActionCard';
import AppButton from '../../Components/UI/AppButton';
import AppInput from '../../Components/UI/AppInput';
import MetricCard from '../../Components/UI/MetricCard';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';

const { colors, spacing, radius, shadow } = AppTheme;

const buildStockDrafts = (stationList) =>
  Object.fromEntries(
    stationList.map((station) => [
      station._id || station.station_regNumber,
      {
        availablePetrol: '',
        availableDiesel: '',
      },
    ]),
  );

const HomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const { showToast } = useAppToast();
  const [stations, setStations] = useState([]);
  const [stockDrafts, setStockDrafts] = useState({});
  const [stationName, setStationName] = useState('');
  const [location, setLocation] = useState('');
  const [stationRegNumber, setStationRegNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingStationId, setSavingStationId] = useState('');

  const totalOperators = stations.reduce((sum, station) => sum + (station.stationOperators?.length || 0), 0);
  const totalVehicles = stations.reduce((sum, station) => sum + (station.registeredVehicles?.length || 0), 0);

  const loadStations = useCallback(async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/stations/getAllStaionsByUserId'), buildMobileRequestConfig(user));
      const stationList = response.data || [];
      setStations(stationList);
      setStockDrafts(buildStockDrafts(stationList));
    } catch (error) {
      console.error('Error fetching stations:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch stations.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const hydrateScreen = async () => {
        setIsLoading(true);
        await loadStations();

        if (!isActive) {
          return;
        }

        try {
          await showUnreadNotificationPopup(user, showToast);
        } catch (notificationError) {
          console.error('Error showing notifications:', notificationError);
        }
      };

      hydrateScreen();

      return () => {
        isActive = false;
      };
    }, [loadStations, showToast, user]),
  );

  const handleRegister = async () => {
    if (!stationName || !location || !stationRegNumber) {
      Alert.alert('Missing Fields', 'Please fill out all station details.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        buildApiUrl('/api/stations/registerStation'),
        {
          stationName,
          location,
          station_regNumber: stationRegNumber,
        },
        buildMobileRequestConfig(user),
      );

      if (response.status === 201) {
        Alert.alert('Success', 'Station registered successfully.');
        setStationName('');
        setLocation('');
        setStationRegNumber('');
        await loadStations();
      } else {
        Alert.alert('Error', response.data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error registering station:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to register station.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockDraftChange = (stationId, field, value) => {
    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return;
    }

    setStockDrafts((current) => ({
      ...current,
      [stationId]: {
        ...(current[stationId] || {}),
        [field]: value,
      },
    }));
  };

  const handleStockUpdate = async (station) => {
    const stationId = station._id || station.station_regNumber;
    const draft = stockDrafts[stationId] || {};

    if (!draft.availablePetrol && !draft.availableDiesel) {
      Alert.alert('Missing Values', 'Enter petrol or diesel amount before updating fuel stock.');
      return;
    }

    try {
      setSavingStationId(stationId);
      const payload = {};

      if (draft.availablePetrol !== '') {
        payload.availablePetrol = draft.availablePetrol;
      }

      if (draft.availableDiesel !== '') {
        payload.availableDiesel = draft.availableDiesel;
      }

      await axios.put(
        buildApiUrl(`/api/stations/update/${station.station_regNumber}`),
        payload,
        buildMobileRequestConfig(user),
      );

      Alert.alert('Success', 'Fuel stock updated successfully.');
      await loadStations();
    } catch (error) {
      console.error('Error updating station fuel stock:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update fuel stock.');
    } finally {
      setSavingStationId('');
    }
  };

  return (
    <ScreenShell
      badge="Station"
      title="Station dashboard"
      subtitle="Manage stations, operators, fuel stock, and station activity."
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Stations" value={`${stations.length}`} style={styles.metricCard} />
        <MetricCard label="Operators" value={`${totalOperators}`} style={styles.metricCard} />
        <MetricCard label="Vehicles" value={`${totalVehicles}`} style={styles.metricCard} />
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader badge="Quick Actions" title="Common tasks" />
        <View style={styles.actionGrid}>
          <ActionCard
            mark="OP"
            title="Manage operators"
            description="Create and review operator accounts."
            tone="teal"
            onPress={() => navigation.navigate('stationOperators')}
          />
          <ActionCard
            mark="FS"
            title="Fuel summary"
            description="View station fuel stock and activity."
            tone="orange"
            onPress={() => navigation.navigate('stationFuelSummary')}
          />
          <ActionCard
            mark="LG"
            title="View logs"
            description="Review recent station dispensing records."
            tone="dark"
            onPress={() => navigation.navigate('stationLogs')}
          />
          <ActionCard
            mark="PR"
            title="Profile"
            description="Update your account details."
            tone="dark"
            onPress={() => navigation.navigate('stationProfile')}
          />
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader badge="Stations" title="My stations" />
        {isLoading ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Loading stations...</Text>
          </View>
        ) : stations.length === 0 ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>No stations registered yet.</Text>
          </View>
        ) : (
          stations.map((station) => {
            const stationId = station._id || station.station_regNumber;

            return (
              <View key={stationId} style={styles.stationCard}>
                <Text style={styles.stationTitle}>{station.stationName}</Text>
                <Text style={styles.stationMeta}>{station.location}</Text>

                <View style={styles.stationStats}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Operators</Text>
                    <Text style={styles.statValue}>{station.stationOperators?.length || 0}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Vehicles</Text>
                    <Text style={styles.statValue}>{station.registeredVehicles?.length || 0}</Text>
                  </View>
                </View>

                <View style={styles.stationStats}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Petrol available</Text>
                    <Text style={styles.statValue}>{station.availablePetrol || 0}L</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Diesel available</Text>
                    <Text style={styles.statValue}>{station.availableDiesel || 0}L</Text>
                  </View>
                </View>

                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>Update available fuel</Text>
                  <View style={styles.inlineFieldGrid}>
                    <AppInput
                      label="Petrol (L)"
                      value={stockDrafts[stationId]?.availablePetrol ?? ''}
                      onChangeText={(value) => handleStockDraftChange(stationId, 'availablePetrol', value)}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      style={styles.inlineInput}
                    />
                    <AppInput
                      label="Diesel (L)"
                      value={stockDrafts[stationId]?.availableDiesel ?? ''}
                      onChangeText={(value) => handleStockDraftChange(stationId, 'availableDiesel', value)}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      style={styles.inlineInput}
                    />
                  </View>
                  <AppButton
                    title={savingStationId === stationId ? 'Updating...' : 'Update fuel stock'}
                    onPress={() => handleStockUpdate(station)}
                    loading={savingStationId === stationId}
                  />
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader
          badge="Station Registration"
          title="Register station"
          subtitle="Enter the station details."
        />
        <View style={styles.formCard}>
          <AppInput label="Station name" value={stationName} onChangeText={setStationName} placeholder="FuelPlus Galle" />
          <AppInput label="Location" value={location} onChangeText={setLocation} placeholder="Galle" />
          <AppInput
            label="Registration number"
            value={stationRegNumber}
            onChangeText={setStationRegNumber}
            placeholder="ST-0001"
          />
          <AppButton title="Register Station" onPress={handleRegister} loading={isSubmitting} />
        </View>
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    width: '47%',
  },
  sectionBlock: {
    gap: spacing.md,
  },
  actionGrid: {
    gap: spacing.md,
  },
  inlineFieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  inlineInput: {
    flex: 1,
    minWidth: 140,
  },
  formCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  formTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stationCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  stationTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  stationMeta: {
    color: colors.textMuted,
    fontSize: 14,
  },
  stationStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  infoCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HomeScreen;
