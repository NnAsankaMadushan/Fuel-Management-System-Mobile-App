import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import { AppTheme } from '../../../constants/Colors';
import { useThemedAlert } from '../../../context/ThemedAlertContext';
import { useUser } from '../../../context/UserContext';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import AppButton from '../../Components/UI/AppButton';
import AppInput from '../../Components/UI/AppInput';
import MetricCard from '../../Components/UI/MetricCard';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';
import StatusChip from '../../Components/UI/StatusChip';

const { colors, spacing, radius, shadow } = AppTheme;
const getStationStatus = (station) => station?.verificationStatus || (station?.isVerified ? 'approved' : 'pending');
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
  const { showAlert } = useThemedAlert();
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationOwnerForm, setStationOwnerForm] = useState(initialStationOwnerForm);
  const [isCreatingOwner, setIsCreatingOwner] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

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
        getStationStatus(station),
      ];

      return searchableValues.some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [stations, searchTerm]);

  const pendingCount = stations.filter((station) => getStationStatus(station) === 'pending').length;

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
      showAlert('Missing fields', 'Fill in all station owner fields before creating the account.');
      return;
    }

    try {
      setIsCreatingOwner(true);
      const response = await axios.post(
        buildApiUrl('/api/users/admin/station-owners'),
        payload,
        buildMobileRequestConfig(user),
      );

      showAlert(
        'Success',
        response.data?.message || 'Station owner account created successfully. They must change the temporary password on first login.',
      );
      setStationOwnerForm(initialStationOwnerForm);
    } catch (error) {
      console.error('Error creating station owner:', error);
      showAlert('Error', error.response?.data?.message || 'Failed to create station owner account.');
    } finally {
      setIsCreatingOwner(false);
    }
  };

  const handleStationReview = async (status) => {
    if (!selectedStation) {
      return;
    }

    try {
      setIsSubmittingDecision(true);
      const response = await axios.patch(
        buildApiUrl(`/api/stations/${selectedStation._id}/approval`),
        { status },
        buildMobileRequestConfig(user),
      );
      showAlert('Success', response.data?.message || `Station ${status} successfully.`);
      setSelectedStation(response.data?.station || selectedStation);
      fetchStations();
    } catch (error) {
      console.error('Error updating station approval:', error);
      showAlert('Error', error.response?.data?.message || 'Failed to update station approval.');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleDeleteStation = async () => {
    if (!selectedStation) return;

    try {
      await axios.delete(buildApiUrl(`/api/stations/deleteStation/${selectedStation._id}`), buildMobileRequestConfig(user));
      showAlert('Success', 'Station deleted successfully.');
      setSelectedStation(null);
      fetchStations();
    } catch (error) {
      console.error('Error deleting station:', error);
      showAlert('Error', 'Failed to delete the station.');
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
      <FlatList
        style={styles.list}
        data={filteredStations}
        keyExtractor={(item) => item._id.toString()}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.metricGrid}>
              <MetricCard label="Stations" value={`${stations.length}`} style={styles.metricCard} />
              <MetricCard label="Pending" value={`${pendingCount}`} style={styles.metricCard} />
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
                <AppInput
                  placeholder="Search station, location, reg number..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  style={styles.searchInput}
                />
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelectedStation(item)} style={styles.listCard}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.stationName}</Text>
              <StatusChip label={getStationStatus(item)} tone={getStationStatus(item)} />
            </View>
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
                <StatusChip label={getStationStatus(selectedStation)} tone={getStationStatus(selectedStation)} />
                <Text style={styles.cardMeta}>Location: {selectedStation.location}</Text>
                <Text style={styles.cardMeta}>Registration: {selectedStation.station_regNumber}</Text>
                <Text style={styles.cardMeta}>Owner: {selectedStation.fuelStationOwner?.name || 'Unavailable'}</Text>
                <Text style={styles.cardMeta}>Note: {selectedStation.approvalNote || 'No admin note added.'}</Text>

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
                  <AppButton
                    title={isSubmittingDecision ? 'Saving...' : 'Approve'}
                    onPress={() => handleStationReview('approved')}
                    disabled={isSubmittingDecision || getStationStatus(selectedStation) === 'approved'}
                  />
                  <AppButton
                    title={isSubmittingDecision ? 'Saving...' : 'Reject'}
                    onPress={() => handleStationReview('rejected')}
                    variant="danger"
                    disabled={isSubmittingDecision || getStationStatus(selectedStation) === 'rejected'}
                  />
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
  list: {
    flex: 1,
  },
  listHeader: {
    gap: spacing.lg,
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
  searchInput: {
    width: '100%',
  },
  searchPanel: {
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
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
