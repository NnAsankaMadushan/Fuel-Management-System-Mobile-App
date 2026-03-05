import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import AppSelect from '../../Components/UI/AppSelect';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';

const { colors, spacing, radius, shadow } = AppTheme;

const VehicleQuotaScreen = () => {
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
      console.error('Error fetching vehicles for quota screen:', fetchError);
      setVehicles([]);
      setSelectedVehicleId('');
      setError(fetchError.response?.data?.message || 'Failed to load vehicle quota.');
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

  const quotaPercent = selectedVehicle?.allocatedQuota
    ? Math.round((Number(selectedVehicle.remainingQuota || 0) / Number(selectedVehicle.allocatedQuota || 1)) * 100)
    : 0;
  const clampedQuotaPercent = Math.max(0, Math.min(quotaPercent, 100));

  return (
    <ScreenShell
      badge="Quota"
      title="Available quota"
      subtitle="Track remaining fuel quota for each registered vehicle."
    >
      {isLoading ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>Loading vehicle quota...</Text>
        </View>
      ) : error ? (
        <View style={[styles.feedbackCard, styles.errorCard]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : vehicles.length === 0 ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>No vehicles connected yet</Text>
          <Text style={styles.feedbackText}>
            Register a vehicle first to see available quota.
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
                <SectionHeader
                  badge="Quota Snapshot"
                  title={selectedVehicle.vehicleNumber || 'Vehicle'}
                />
                <View style={styles.quotaCard}>
                  <View style={styles.quotaHeader}>
                    <Text style={styles.quotaValue}>{selectedVehicle.remainingQuota || 0}L</Text>
                    <Text style={styles.quotaMeta}>{clampedQuotaPercent}% remaining</Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${clampedQuotaPercent}%` }]} />
                  </View>

                  <View style={styles.detailGrid}>
                    <View style={styles.detailInfoCard}>
                      <Text style={styles.detailLabel}>Fuel type</Text>
                      <Text style={styles.detailValue}>{selectedVehicle.fuelType || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailInfoCard}>
                      <Text style={styles.detailLabel}>Vehicle type</Text>
                      <Text style={styles.detailValue}>{selectedVehicle.vehicleType || 'N/A'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>Select a vehicle to see available quota.</Text>
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
  quotaCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  quotaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quotaValue: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  quotaMeta: {
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
    fontSize: 20,
    fontWeight: '800',
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

export default VehicleQuotaScreen;
