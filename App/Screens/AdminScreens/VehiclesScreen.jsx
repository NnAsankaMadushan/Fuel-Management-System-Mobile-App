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
import StatusChip from '../../Components/UI/StatusChip';

const { colors, spacing, radius, shadow } = AppTheme;

const getVehicleStatus = (vehicle) => vehicle?.verificationStatus || (vehicle?.isVerified ? 'approved' : 'pending');
const getRecordTime = (item) => {
  const createdTime = new Date(item?.createdAt || item?.updatedAt || '').getTime();
  return Number.isFinite(createdTime) ? createdTime : 0;
};
const sortNewestFirst = (items = []) => [...items].sort((a, b) => getRecordTime(b) - getRecordTime(a));

const VehiclesScreen = () => {
  const { user } = useUser();
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/vehicles'), buildMobileRequestConfig(user));
      setVehicles(sortNewestFirst(Array.isArray(response.data) ? response.data : []));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const filteredVehicles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => {
      const searchableValues = [
        vehicle.vehicleNumber,
        vehicle.vehicleType,
        vehicle.fuelType,
        vehicle.vehicleOwnerName,
        getVehicleStatus(vehicle),
      ];

      return searchableValues.some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [vehicles, searchTerm]);

  const pendingCount = vehicles.filter((vehicle) => getVehicleStatus(vehicle) === 'pending').length;

  const handleVehicleReview = async (status) => {
    if (!selectedVehicle) {
      return;
    }

    try {
      setIsSubmittingDecision(true);
      const response = await axios.patch(
        buildApiUrl(`/api/vehicles/${selectedVehicle._id}/approval`),
        { status },
        buildMobileRequestConfig(user),
      );
      Alert.alert('Success', response.data.message || `Vehicle ${status} successfully.`);
      setSelectedVehicle(response.data.vehicle);
      fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle approval:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update vehicle approval.');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      await axios.delete(buildApiUrl(`/api/vehicles/${selectedVehicle._id}`), buildMobileRequestConfig(user));
      Alert.alert('Success', 'Vehicle deleted successfully.');
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      Alert.alert('Error', 'Failed to delete the vehicle.');
    }
  };

  return (
    <ScreenShell
      badge="Admin"
      title="Vehicles"
      subtitle="Review, approve, or remove vehicle records."
      scroll={false}
      contentContainerStyle={styles.shellBody}
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Vehicles" value={`${vehicles.length}`} style={styles.metricCard} />
        <MetricCard label="Pending" value={`${pendingCount}`} style={styles.metricCard} />
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader badge="Records" title="Vehicle records" subtitle="Search by number, type, owner, or status." />
        <View style={styles.searchPanel}>
          <AppInput placeholder="Search vehicle, owner, status..." value={searchTerm} onChangeText={setSearchTerm} />
        </View>
      </View>

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelectedVehicle(item)} style={styles.listCard}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.vehicleNumber}</Text>
              <StatusChip label={getVehicleStatus(item)} tone={getVehicleStatus(item)} />
            </View>
            <Text style={styles.cardMeta}>{item.vehicleType || 'Type unavailable'}</Text>
            <Text style={styles.cardMeta}>{item.vehicleOwnerName || 'Owner unavailable'}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No vehicles found</Text>
            <Text style={styles.cardMeta}>Try a different vehicle number.</Text>
          </View>
        }
      />

      <Modal visible={!!selectedVehicle} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {selectedVehicle ? (
              <>
                <Text style={styles.modalTitle}>{selectedVehicle.vehicleNumber}</Text>
                <StatusChip label={getVehicleStatus(selectedVehicle)} tone={getVehicleStatus(selectedVehicle)} />
                <Text style={styles.cardMeta}>Vehicle Number: {selectedVehicle.vehicleNumber}</Text>
                <Text style={styles.cardMeta}>Vehicle Type: {selectedVehicle.vehicleType}</Text>
                <Text style={styles.cardMeta}>Fuel Type: {selectedVehicle.fuelType}</Text>
                <Text style={styles.cardMeta}>Owner: {selectedVehicle.vehicleOwnerName}</Text>
                <Text style={styles.cardMeta}>Note: {selectedVehicle.approvalNote || 'No admin note added.'}</Text>
                <View style={styles.buttonStack}>
                  <AppButton
                    title={isSubmittingDecision ? 'Saving...' : 'Approve'}
                    onPress={() => handleVehicleReview('approved')}
                    disabled={isSubmittingDecision || getVehicleStatus(selectedVehicle) === 'approved'}
                  />
                  <AppButton
                    title={isSubmittingDecision ? 'Saving...' : 'Reject'}
                    onPress={() => handleVehicleReview('rejected')}
                    variant="danger"
                    disabled={isSubmittingDecision || getVehicleStatus(selectedVehicle) === 'rejected'}
                  />
                  <AppButton title="Delete Vehicle" onPress={handleDeleteVehicle} variant="danger" />
                  <AppButton title="Close" onPress={() => setSelectedVehicle(null)} variant="secondary" />
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
    gap: spacing.sm,
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
    ...shadow.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  buttonStack: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});

export default VehiclesScreen;
