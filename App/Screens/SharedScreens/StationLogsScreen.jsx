import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import { AppTheme } from '../../../constants/Colors';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import MetricCard from '../../Components/UI/MetricCard';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';

const { colors, spacing, radius, shadow } = AppTheme;

const toDateKey = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildRecentDays = (days = 7) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  return Array.from({ length: days }).map((_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);

    return {
      key: toDateKey(current),
      label: current.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  });
};

const StationLogsScreen = () => {
  const { user } = useUser();
  const isOperator = user?.role === 'station_operator';
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDateKey, setSelectedDateKey] = useState('');

  const recentDays = useMemo(() => buildRecentDays(7), []);

  const dailyTotals = useMemo(
    () =>
      logs.reduce((accumulator, item) => {
        const key = toDateKey(item?.date);

        if (!key) {
          return accumulator;
        }

        accumulator[key] = (accumulator[key] || 0) + Number(item?.litresPumped || 0);
        return accumulator;
      }, {}),
    [logs],
  );

  const weeklyChart = useMemo(
    () =>
      recentDays.map((day) => ({
        ...day,
        litres: dailyTotals[day.key] || 0,
      })),
    [dailyTotals, recentDays],
  );

  const chartPeak = useMemo(
    () => Math.max(...weeklyChart.map((item) => Number(item.litres || 0)), 1),
    [weeklyChart],
  );

  const filteredLogs = useMemo(
    () =>
      selectedDateKey
        ? logs.filter((item) => toDateKey(item?.date) === selectedDateKey)
        : logs,
    [logs, selectedDateKey],
  );

  const totalLitres = useMemo(
    () => filteredLogs.reduce((sum, item) => sum + Number(item.litresPumped || 0), 0),
    [filteredLogs],
  );

  const loadLogs = useCallback(async () => {
    try {
      setError('');
      const response = await axios.get(buildApiUrl('/api/fuel/station-logs'), buildMobileRequestConfig(user));
      setLogs(response.data || []);
    } catch (fetchError) {
      console.error('Error fetching station logs:', fetchError);
      setError(fetchError.response?.data?.message || 'Failed to load station logs.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadLogs();
    }, [loadLogs]),
  );

  return (
    <ScreenShell
      badge={isOperator ? 'Operator Logs' : 'Station Logs'}
      title="Station logs"
      subtitle="Review recent station fuel transactions."
    >
      <View style={styles.metricGrid}>
        <MetricCard
          label="Entries"
          value={`${filteredLogs.length}`}
          note={selectedDateKey ? `Filtered: ${selectedDateKey}` : 'All days'}
          style={styles.metricCard}
        />
        <MetricCard
          label="Litres"
          value={`${totalLitres}L`}
          note={selectedDateKey ? 'Selected day total' : '7-day visible total'}
          style={styles.metricCard}
        />
      </View>

      {error ? (
        <View style={[styles.feedbackCard, styles.errorCard]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.sectionBlock}>
        <SectionHeader
          badge="Weekly Activity"
          title="Past 7 days"
          subtitle="Tap a day bar to filter transactions for that date."
        />

        <View style={styles.chartCard}>
          <View style={styles.sparkChart}>
            {weeklyChart.map((item) => {
              const barHeight = Math.max(14, Math.round((Number(item.litres || 0) / chartPeak) * 110));
              const isSelected = selectedDateKey === item.key;

              return (
                <Pressable
                  key={`bar-${item.key}`}
                  onPress={() => setSelectedDateKey((current) => (current === item.key ? '' : item.key))}
                  style={styles.sparkBarColumn}
                >
                  <View style={[styles.sparkBar, { height: barHeight }, isSelected ? styles.sparkBarActive : null]} />
                  <Text style={[styles.sparkLabel, isSelected ? styles.sparkLabelActive : null]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {selectedDateKey ? (
            <Pressable onPress={() => setSelectedDateKey('')} style={styles.clearFilterButton}>
              <Text style={styles.clearFilterText}>Show all transactions</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>Loading station logs...</Text>
        </View>
      ) : filteredLogs.length === 0 ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>
            {selectedDateKey
              ? `No transactions found for ${selectedDateKey}.`
              : 'No station logs found yet.'}
          </Text>
        </View>
      ) : (
        <View style={styles.listContent}>
          {filteredLogs.map((item) => (
            <View key={item._id} style={styles.logCard}>
              <View style={styles.logTop}>
                <Text style={styles.logVehicle}>{item.vehicleNumber || 'Unknown vehicle'}</Text>
                <Text style={styles.logLitres}>{item.litresPumped}L</Text>
              </View>
              <Text style={styles.logMeta}>
                {item.stationName || 'Station'} - {item.fuelType || 'Fuel'}
              </Text>
              <Text style={styles.logMeta}>{new Date(item.date).toLocaleString()}</Text>
            </View>
          ))}
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
  sectionBlock: {
    gap: spacing.md,
  },
  chartCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  sparkChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
  },
  sparkBarColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  sparkBar: {
    width: '75%',
    minHeight: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  sparkBarActive: {
    backgroundColor: colors.accentStrong,
    width: '82%',
  },
  sparkLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sparkLabelActive: {
    color: colors.accentStrong,
  },
  clearFilterButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  clearFilterText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  logCard: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  logTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  logVehicle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  logLitres: {
    color: colors.accentStrong,
    fontSize: 16,
    fontWeight: '800',
  },
  logMeta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
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

export default StationLogsScreen;
