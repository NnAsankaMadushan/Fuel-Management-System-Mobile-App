import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import { AppTheme } from '../../../constants/Colors';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import MetricCard from '../../Components/UI/MetricCard';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';

const { colors, spacing, radius, shadow } = AppTheme;

const initialSummary = {
  totalStations: 0,
  totalRegisteredVehicles: 0,
  totalAvailablePetrol: 0,
  totalAvailableDiesel: 0,
  totalTransactions: 0,
  totalLitresDispensed: 0,
};

const FuelAvailabilityRingCard = ({ label, litres, note, tone = 'petrol', isLoading = false }) => {
  const displayLitres = isLoading ? '...' : `${litres}`;

  return (
    <View style={styles.availabilityCard}>
      <View style={[styles.ringOuter, tone === 'diesel' ? styles.ringOuterDiesel : styles.ringOuterPetrol]}>
        <View style={styles.ringValueRow}>
          <Text style={[styles.ringValue, tone === 'diesel' ? styles.ringValueDiesel : styles.ringValuePetrol]}>
            {displayLitres}
          </Text>
          <Text style={[styles.ringUnit, tone === 'diesel' ? styles.ringUnitDiesel : styles.ringUnitPetrol]}>
            LITERS
          </Text>
        </View>
      </View>

      <Text style={styles.ringFuelLabel}>{label}</Text>
      <Text style={styles.ringAvailable}>{displayLitres}L available</Text>
      <Text style={styles.ringNote}>{note}</Text>
    </View>
  );
};

const StationFuelSummaryScreen = () => {
  const { user } = useUser();
  const isOperator = user?.role === 'station_operator';
  const [summary, setSummary] = useState(initialSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async () => {
    try {
      setError('');
      const response = await axios.get(
        buildApiUrl('/api/fuel/station-summary'),
        buildMobileRequestConfig(user),
      );
      setSummary({ ...initialSummary, ...response.data });
    } catch (fetchError) {
      console.error('Error fetching station fuel summary:', fetchError);
      setError(fetchError.response?.data?.message || 'Failed to load station fuel summary.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadSummary();
    }, [loadSummary]),
  );

  const totalFuel = Number(summary.totalAvailablePetrol || 0) + Number(summary.totalAvailableDiesel || 0);

  return (
    <ScreenShell
      badge={isOperator ? 'Operator Fuel' : 'Station Fuel'}
      title="Fuel summary"
      subtitle={
        isOperator
          ? 'Check current petrol and diesel stock for your assigned station.'
          : 'Review current fuel stock and recent station activity.'
      }
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Transactions" value={`${summary.totalTransactions}`} style={styles.metricCard} />
        <MetricCard label="Dispensed" value={`${summary.totalLitresDispensed}L`} style={styles.metricCard} />
        {!isOperator ? <MetricCard label="Stations" value={`${summary.totalStations}`} style={styles.metricCard} /> : null}
        {!isOperator ? <MetricCard label="Vehicles" value={`${summary.totalRegisteredVehicles}`} style={styles.metricCard} /> : null}
      </View>

      {error ? (
        <View style={[styles.feedbackCard, styles.errorCard]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {isOperator && isLoading ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>Loading station fuel summary...</Text>
        </View>
      ) : null}

      <View style={styles.sectionBlock}>
        <SectionHeader
          badge="Fuel Stats"
          title="Overall available fuel"
          subtitle="Live fuel split across all stations assigned to you."
        />

        <View style={styles.availabilityGrid}>
          <FuelAvailabilityRingCard
            label="Petrol"
            litres={summary.totalAvailablePetrol}
            note="Available petrol stock"
            tone="petrol"
            isLoading={isLoading}
          />
          <FuelAvailabilityRingCard
            label="Diesel"
            litres={summary.totalAvailableDiesel}
            note="Available diesel stock"
            tone="diesel"
            isLoading={isLoading}
          />
        </View>

        <View style={styles.totalFuelCard}>
          <Text style={styles.totalFuelLabel}>Total available</Text>
          <Text style={styles.totalFuelValue}>{isLoading ? '...' : `${totalFuel}L`}</Text>
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
  availabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  availabilityCard: {
    width: '47%',
    minWidth: 160,
    alignItems: 'center',
    gap: 6,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  ringOuter: {
    width: 138,
    height: 138,
    borderRadius: 999,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ringOuterPetrol: {
    borderColor: 'rgba(221, 91, 17, 0.20)',
  },
  ringOuterDiesel: {
    borderColor: 'rgba(13, 148, 136, 0.22)',
  },
  ringValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  ringValue: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
  },
  ringValuePetrol: {
    color: colors.accentStrong,
  },
  ringValueDiesel: {
    color: colors.teal,
  },
  ringUnit: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  ringUnitPetrol: {
    color: colors.accentStrong,
  },
  ringUnitDiesel: {
    color: colors.teal,
  },
  ringFuelLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ringAvailable: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  ringNote: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  totalFuelCard: {
    gap: 4,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  totalFuelLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  totalFuelValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
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

export default StationFuelSummaryScreen;
