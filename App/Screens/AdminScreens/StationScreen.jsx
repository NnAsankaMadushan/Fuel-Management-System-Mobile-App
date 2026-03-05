import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import AppButton from '../../Components/UI/AppButton';
import AppInput from '../../Components/UI/AppInput';
import MetricCard from '../../Components/UI/MetricCard';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';

const { colors, spacing, radius, shadow } = AppTheme;
const getRecordTime = (item) => {
  const createdTime = new Date(item?.createdAt || item?.updatedAt || '').getTime();
  return Number.isFinite(createdTime) ? createdTime : 0;
};
const sortNewestFirst = (items = []) => [...items].sort((a, b) => getRecordTime(b) - getRecordTime(a));
const initialStationOwnerForm = {
  name: '',
  email: '',
  password: '',
  phoneNumber: '',
  nicNumber: '',
};

const StationScreen = () => {
  const { user } = useUser();
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationOwnerForm, setStationOwnerForm] = useState(initialStationOwnerForm);
  const [isCreatingOwner, setIsCreatingOwner] = useState(false);

  const fetchStations = useCallback(async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/stations'), buildMobileRequestConfig(user));
      setStations(sortNewestFirst(Array.isArray(response.data) ? response.data : []));
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const filteredStations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return stations;
    }

    return stations.filter((station) => {
      const searchableValues = [
        station.stationName,
        station.location,
        station.station_regNumber,
        station.fuelStationOwner?.name,
      ];

      return searchableValues.some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [stations, searchTerm]);

  const totalVehicles = stations.reduce((sum, station) => sum + (station.registeredVehicles?.length || 0), 0);

  const handleStationOwnerFieldChange = (field, value) => {
    setStationOwnerForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateStationOwner = async () => {
    const payload = {
      name: stationOwnerForm.name.trim(),
      email: stationOwnerForm.email.trim(),
      password: stationOwnerForm.password,
      phoneNumber: stationOwnerForm.phoneNumber.trim(),
      nicNumber: stationOwnerForm.nicNumber.trim(),
    };

    if (Object.values(payload).some((value) => !value)) {
      Alert.alert('Missing fields', 'Fill in all station owner fields before creating the account.');
      return;
    }

    try {
      setIsCreatingOwner(true);
      const response = await axios.post(
        buildApiUrl('/api/users/admin/station-owners'),
        payload,
        buildMobileRequestConfig(user),
      );

      Alert.alert(
        'Success',
        response.data?.message || 'Station owner account created successfully. They must change the temporary password on first login.',
      );
      setStationOwnerForm(initialStationOwnerForm);
    } catch (error) {
      console.error('Error creating station owner:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create station owner account.');
    } finally {
      setIsCreatingOwner(false);
    }
  };

  const handleDeleteStation = async () => {
    if (!selectedStation) return;

    try {
      await axios.delete(buildApiUrl(`/api/stations/deleteStation/${selectedStation._id}`), buildMobileRequestConfig(user));
      Alert.alert('Success', 'Station deleted successfully.');
      setSelectedStation(null);
      fetchStations();
    } catch (error) {
      console.error('Error deleting station:', error);
      Alert.alert('Error', 'Failed to delete the station.');
    }
  };

  return (
    <ScreenShell
      badge="Admin"
      title="Stations"
      subtitle="Browse and manage station records."
      scroll={false}
      contentContainerStyle={styles.shellBody}
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Stations" value={`${stations.length}`} style={styles.metricCard} />
        <MetricCard label="Vehicles" value={`${totalVehicles}`} style={styles.metricCard} />
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader badge="Accounts" title="Create station owner" subtitle="Admin-only account creation." />
        <View style={styles.formPanel}>
          <AppInput
            label="Full name"
            placeholder="Station owner name"
            value={stationOwnerForm.name}
            onChangeText={(value) => handleStationOwnerFieldChange('name', value)}
          />
          <AppInput
            label="Email"
            placeholder="owner@example.com"
            value={stationOwnerForm.email}
            onChangeText={(value) => handleStationOwnerFieldChange('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <AppInput
            label="Phone number"
            placeholder="0771234567"
            value={stationOwnerForm.phoneNumber}
            onChangeText={(value) => handleStationOwnerFieldChange('phoneNumber', value)}
            keyboardType="phone-pad"
          />
          <AppInput
            label="NIC number"
            placeholder="200012345678 or 123456789V"
            value={stationOwnerForm.nicNumber}
            onChangeText={(value) => handleStationOwnerFieldChange('nicNumber', value)}
            autoCapitalize="characters"
          />
          <AppInput
            label="Temporary password"
            placeholder="Set an initial password"
            value={stationOwnerForm.password}
            onChangeText={(value) => handleStationOwnerFieldChange('password', value)}
            secureTextEntry
          />
          <AppButton title="Create Station Owner" onPress={handleCreateStationOwner} loading={isCreatingOwner} />
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader badge="Records" title="Station records" subtitle="Search by name, location, or registration number." />
        <View style={styles.searchPanel}>
          <AppInput placeholder="Search station, location, reg number..." value={searchTerm} onChangeText={setSearchTerm} />
        </View>
      </View>

      <FlatList
        data={filteredStations}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelectedStation(item)} style={styles.listCard}>
            <Text style={styles.cardTitle}>{item.stationName}</Text>
            <Text style={styles.cardMeta}>{item.location}</Text>
            <Text style={styles.cardMeta}>{item.station_regNumber}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No stations found</Text>
            <Text style={styles.cardMeta}>Try a different station name.</Text>
          </View>
        }
      />

      <Modal visible={!!selectedStation} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {selectedStation ? (
              <>
                <Text style={styles.modalTitle}>{selectedStation.stationName}</Text>
                <Text style={styles.cardMeta}>Location: {selectedStation.location}</Text>
                <Text style={styles.cardMeta}>Registration: {selectedStation.station_regNumber}</Text>
                <Text style={styles.cardMeta}>Owner: {selectedStation.fuelStationOwner?.name || 'Unavailable'}</Text>

                <View style={styles.registeredBox}>
                  <Text style={styles.sectionLabel}>Registered vehicles</Text>
                  {(selectedStation.registeredVehicles || []).length > 0 ? (
                    selectedStation.registeredVehicles.map((item) => (
                      <View key={item._id} style={styles.vehicleRow}>
                        <Text style={styles.vehicleText}>{item.vehicle?.vehicleNumber || 'Unknown vehicle'}</Text>
                        <Text style={styles.cardMeta}>{item.vehicle?.vehicleType || 'Type unavailable'}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.cardMeta}>No registered vehicles.</Text>
                  )}
                </View>

                <View style={styles.buttonStack}>
                  <AppButton title="Delete Station" onPress={handleDeleteStation} variant="danger" />
                  <AppButton title="Close" onPress={() => setSelectedStation(null)} variant="secondary" />
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  shellBody: {
    flex: 1,
  },
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
  searchPanel: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  formPanel: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  listContent: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  listCard: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: 14,
  },
  emptyCard: {
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.overlay,
  },
  modalCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    maxHeight: '84%',
    ...shadow.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  registeredBox: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  vehicleRow: {
    gap: 4,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  vehicleText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonStack: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});

export default StationScreen;
