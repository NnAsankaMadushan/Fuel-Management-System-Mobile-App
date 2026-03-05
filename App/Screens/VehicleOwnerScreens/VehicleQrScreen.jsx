import React, { useCallback, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import AppSelect from '../../Components/UI/AppSelect';
import MetricCard from '../../Components/UI/MetricCard';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';
import StatusChip from '../../Components/UI/StatusChip';

const { colors, spacing, radius, shadow } = AppTheme;

const getVehicleStatus = (vehicle) => vehicle?.verificationStatus || (vehicle?.isVerified ? 'approved' : 'pending');

const getStatusTone = (status) => {
  if (status === 'approved' || status === 'verified') return 'approved';
  if (status === 'rejected') return 'rejected';
  return 'pending';
};

const formatStatus = (status) => {
  const normalizedStatus = String(status || 'pending').toLowerCase();
  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
};

const VehicleQrScreen = () => {
  const { user } = useUser();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVehicles = useCallback(async () => {
    if (!user) {
      setVehicles([]);
      setSelectedVehicleId('');
      setIsLoading(false);
      setError('');
      return;
    }

    try {
      setError('');
      const response = await axios.get(
        buildApiUrl('/api/vehicles/mine'),
        buildMobileRequestConfig(user),
      );
      const nextVehicles = response.data || [];
      setVehicles(nextVehicles);
      setSelectedVehicleId((currentValue) => {
        if (currentValue && nextVehicles.some((vehicle) => vehicle._id === currentValue)) {
          return currentValue;
        }
        return nextVehicles[0]?._id || '';
      });
    } catch (fetchError) {
      console.error('Error fetching vehicles for QR screen:', fetchError);
      setVehicles([]);
      setSelectedVehicleId('');
      setError(fetchError.response?.data?.message || 'Failed to load vehicle details.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadVehicles();
    }, [loadVehicles]),
  );

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle._id === selectedVehicleId) || null,
    [vehicles, selectedVehicleId],
  );

  const status = getVehicleStatus(selectedVehicle);
  const quotaPercent = selectedVehicle?.allocatedQuota
    ? Math.round((Number(selectedVehicle.remainingQuota || 0) / Number(selectedVehicle.allocatedQuota || 1)) * 100)
    : 0;
  const canUseQr = status === 'approved' || status === 'verified';

  return (
    <ScreenShell
      badge="Vehicle"
      title="Vehicle details"
      subtitle="Select a vehicle to view details and QR access."
    >
      {isLoading ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>Loading vehicles...</Text>
        </View>
      ) : error ? (
        <View style={[styles.feedbackCard, styles.errorCard]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : vehicles.length === 0 ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>No vehicles connected yet</Text>
          <Text style={styles.feedbackText}>
            Register a vehicle first to see details and a fuel QR code.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.sectionBlock}>
            <SectionHeader badge="My Vehicles" title="Choose vehicle" />
            <AppSelect
              label="Registered vehicles"
              options={vehicles.map((vehicle) => ({
                label: vehicle.vehicleNumber,
                value: vehicle._id,
              }))}
              selectedValue={selectedVehicleId}
              onValueChange={setSelectedVehicleId}
              placeholder="Choose a vehicle"
            />
          </View>

          {selectedVehicle ? (
            <>
              <View style={styles.sectionBlock}>
                <SectionHeader badge="QR Access" title="Fuel QR code" />
                {canUseQr && selectedVehicle.qrCode ? (
                  <View style={styles.qrCard}>
                    <Image source={{ uri: selectedVehicle.qrCode }} style={styles.qrImage} resizeMode="contain" />
                  </View>
                ) : (
                  <View style={styles.feedbackCard}>
                    <Text style={styles.feedbackText}>
                      {status === 'pending'
                        ? 'QR access will be available after admin approval.'
                        : 'This vehicle was rejected. QR access is disabled until it is approved.'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.metricGrid}>
                <MetricCard label="Fuel type" value={selectedVehicle.fuelType || 'N/A'} style={styles.metricCard} />
                <MetricCard
                  label="Remaining quota"
                  value={`${selectedVehicle.remainingQuota || 0}L`}
                  style={styles.metricCard}
                />
                <View style={styles.statusMetric}>
                  <Text style={styles.statusMetricLabel}>Status</Text>
                  <StatusChip label={formatStatus(status)} tone={getStatusTone(status)} />
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <SectionHeader badge="Vehicle Snapshot" title={selectedVehicle.vehicleNumber || 'Vehicle'} />
                <View style={styles.detailCard}>
                  <View style={styles.progressHead}>
                    <Text style={styles.progressValue}>{selectedVehicle.remainingQuota || 0}L</Text>
                    <Text style={styles.progressMeta}>{quotaPercent}% remaining</Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(quotaPercent, 100))}%` }]} />
                  </View>

                  <View style={styles.detailGrid}>
                    <View style={styles.detailInfoCard}>
                      <Text style={styles.detailLabel}>Vehicle type</Text>
                      <Text style={styles.detailValue}>{selectedVehicle.vehicleType || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailInfoCard}>
                      <Text style={styles.detailLabel}>Allocated quota</Text>
                      <Text style={styles.detailValue}>{selectedVehicle.allocatedQuota || 0}L</Text>
                    </View>
                  </View>

                  <View style={styles.detailInfoCard}>
                    <Text style={styles.detailLabel}>Admin note</Text>
                    <Text style={styles.detailText}>
                      {selectedVehicle.approvalNote ||
                        (status === 'pending'
                          ? 'Waiting for admin approval.'
                          : 'No admin note is available for this vehicle.')}
                    </Text>
                  </View>

                  <View style={styles.detailInfoCard}>
                    <Text style={styles.detailLabel}>Last reviewed</Text>
                    <Text style={styles.detailText}>
                      {selectedVehicle.reviewedAt
                        ? new Date(selectedVehicle.reviewedAt).toLocaleString()
                        : 'Not reviewed yet'}
                    </Text>
                  </View>
                </View>
              </View>

            </>
          ) : (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>Select a vehicle to view details.</Text>
            </View>
          )}
        </>
      )}
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  sectionBlock: {
    gap: spacing.md,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    width: '47%',
  },
  statusMetric: {
    gap: spacing.sm,
    width: '100%',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  statusMetricLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  progressHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  progressValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  progressMeta: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detailInfoCard: {
    gap: spacing.xs,
    flex: 1,
    minWidth: 140,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  detailText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  qrCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  qrImage: {
    width: 240,
    height: 240,
  },
  feedbackCard: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  feedbackTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  feedbackText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(220, 76, 63, 0.16)',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});

export default VehicleQrScreen;
