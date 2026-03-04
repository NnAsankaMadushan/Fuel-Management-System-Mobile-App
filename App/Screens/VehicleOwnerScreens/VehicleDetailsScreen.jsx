import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
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

const VehicleDetailsScreen = ({ route }) => {
  const { user } = useUser();
  const vehicleId = route?.params?.vehicleId;
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVehicle = useCallback(async () => {
    if (!user || !vehicleId) {
      setVehicle(null);
      setIsLoading(false);
      setError(vehicleId ? '' : 'Vehicle details are unavailable.');
      return;
    }

    try {
      setError('');
      const response = await axios.get(
        buildApiUrl(`/api/vehicles/${vehicleId}`),
        buildMobileRequestConfig(user),
      );
      setVehicle(response.data || null);
    } catch (fetchError) {
      console.error('Error fetching vehicle details:', fetchError);
      setVehicle(null);
      setError(fetchError.response?.data?.message || 'Failed to load vehicle details.');
    } finally {
      setIsLoading(false);
    }
  }, [user, vehicleId]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadVehicle();
    }, [loadVehicle]),
  );

  const status = getVehicleStatus(vehicle);
  const quotaPercent = vehicle?.allocatedQuota
    ? Math.round((Number(vehicle.remainingQuota || 0) / Number(vehicle.allocatedQuota || 1)) * 100)
    : 0;
  const canUseQr = status === 'approved' || status === 'verified';

  return (
    <ScreenShell
      badge="Vehicle Details"
      title={vehicle?.vehicleNumber || 'Vehicle'}
      subtitle="Vehicle details, approval status, and QR access."
    >
      {isLoading ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>Loading vehicle details...</Text>
        </View>
      ) : error ? (
        <View style={[styles.feedbackCard, styles.errorCard]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : vehicle ? (
        <>
          <View style={styles.metricGrid}>
            <MetricCard label="Fuel type" value={vehicle.fuelType || 'N/A'} style={styles.metricCard} />
            <MetricCard label="Remaining quota" value={`${vehicle.remainingQuota || 0}L`} style={styles.metricCard} />
            <View style={styles.statusMetric}>
              <Text style={styles.statusMetricLabel}>Status</Text>
              <StatusChip label={formatStatus(status)} tone={getStatusTone(status)} />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeader badge="Quota Snapshot" title="Quota" />
            <View style={styles.detailCard}>
              <View style={styles.progressHead}>
                <Text style={styles.progressValue}>{vehicle.remainingQuota || 0}L</Text>
                <Text style={styles.progressMeta}>{quotaPercent}% remaining</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(quotaPercent, 100))}%` }]} />
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.detailInfoCard}>
                  <Text style={styles.detailLabel}>Allocated quota</Text>
                  <Text style={styles.detailValue}>{vehicle.allocatedQuota || 0}L</Text>
                </View>
                <View style={styles.detailInfoCard}>
                  <Text style={styles.detailLabel}>Used quota</Text>
                  <Text style={styles.detailValue}>{vehicle.usedQuota || 0}L</Text>
                </View>
              </View>

              <View style={styles.detailInfoCard}>
                <Text style={styles.detailLabel}>Admin note</Text>
                <Text style={styles.detailText}>
                  {vehicle.approvalNote ||
                    (status === 'pending'
                      ? 'Waiting for admin approval.'
                      : 'No admin note is available for this vehicle.')}
                </Text>
              </View>

              <View style={styles.detailInfoCard}>
                <Text style={styles.detailLabel}>Last reviewed</Text>
                <Text style={styles.detailText}>
                  {vehicle.reviewedAt ? new Date(vehicle.reviewedAt).toLocaleString() : 'Not reviewed yet'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeader badge="QR Access" title="QR code" />
            {canUseQr && vehicle.qrCode ? (
              <View style={styles.qrCard}>
                <Image source={{ uri: vehicle.qrCode }} style={styles.qrImage} resizeMode="contain" />
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
        </>
      ) : (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>Vehicle details are unavailable.</Text>
        </View>
      )}
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
  sectionBlock: {
    gap: spacing.md,
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
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  errorCard: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(220, 76, 63, 0.16)',
  },
  feedbackText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});

export default VehicleDetailsScreen;
