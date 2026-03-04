import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import { AppTheme } from '../../../constants/Colors';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import AppButton from '../../Components/UI/AppButton';
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
  chart: [],
};

const StationFuelSummaryScreen = () => {
  const { logoutUser, user } = useUser();
  const isOperator = user?.role === 'station_operator';
  const [summary, setSummary] = useState(initialSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async () => {
    try {
      setError('');
      const response = await axios.get(buildApiUrl('/api/fuel/station-summary'), buildMobileRequestConfig(user));
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
        <MetricCard label="Petrol Available" value={`${summary.totalAvailablePetrol}L`} style={styles.metricCard} />
        <MetricCard label="Diesel Available" value={`${summary.totalAvailableDiesel}L`} style={styles.metricCard} />
        {!isOperator ? (
          <>
            <MetricCard label="Stations" value={`${summary.totalStations}`} style={styles.metricCard} />
            <MetricCard label="Transactions" value={`${summary.totalTransactions}`} style={styles.metricCard} />
            <MetricCard label="Dispensed" value={`${summary.totalLitresDispensed}L`} style={styles.metricCard} />
            <MetricCard label="Vehicles" value={`${summary.totalRegisteredVehicles}`} style={styles.metricCard} />
          </>
        ) : null}
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

      {!isOperator ? (
        <View style={styles.sectionBlock}>
          <SectionHeader
            badge="Weekly Activity"
            title="Past 7 days"
            subtitle="Daily litres dispensed for the station scope."
          />

          {isLoading ? (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>Loading station fuel summary...</Text>
            </View>
          ) : summary.chart.length === 0 ? (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>No recent station activity found.</Text>
            </View>
          ) : (
            <View style={styles.dayList}>
              {summary.chart.map((item) => (
                <View key={item.date} style={styles.dayCard}>
                  <Text style={styles.dayLabel}>{item.label}</Text>
                  <Text style={styles.dayValue}>{item.litres}L</Text>
                  <Text style={styles.dayDate}>{item.date}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {isOperator ? <AppButton title="Logout" onPress={logoutUser} variant="danger" /> : null}
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
  dayList: {
    gap: spacing.sm,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  dayLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  dayValue: {
    color: colors.accentStrong,
    fontSize: 16,
    fontWeight: '800',
  },
  dayDate: {
    color: colors.textMuted,
    fontSize: 12,
  },
});

export default StationFuelSummaryScreen;
