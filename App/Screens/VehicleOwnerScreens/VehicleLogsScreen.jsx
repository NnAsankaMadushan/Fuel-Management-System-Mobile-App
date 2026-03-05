import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import { AppTheme } from '../../../constants/Colors';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import MetricCard from '../../Components/UI/MetricCard';
import ScreenShell from '../../Components/UI/ScreenShell';

const { colors, spacing, radius, shadow } = AppTheme;

const VehicleLogsScreen = () => {
  const { user } = useUser();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const totalLitres = useMemo(
    () => logs.reduce((sum, item) => sum + Number(item.litresPumped || 0), 0),
    [logs],
  );

  const loadLogs = useCallback(async () => {
    if (!user) {
      setLogs([]);
      setIsLoading(false);
      setError('');
      return;
    }

    try {
      setError('');
      const response = await axios.get(
        buildApiUrl('/api/fuel/vehicle-logs'),
        buildMobileRequestConfig(user),
      );
      setLogs(response.data || []);
    } catch (fetchError) {
      console.error('Error fetching vehicle logs:', fetchError);
      setError(fetchError.response?.data?.message || 'Failed to load vehicle logs.');
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
      badge="Logs"
      title="Vehicle logs"
      subtitle="Review past fuel transactions across your registered vehicles."
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Entries" value={`${logs.length}`} style={styles.metricCard} />
        <MetricCard label="Liters" value={`${totalLitres}L`} style={styles.metricCard} />
      </View>

      {error ? (
        <View style={[styles.feedbackCard, styles.errorCard]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>Loading vehicle logs...</Text>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>No vehicle transactions were found yet.</Text>
        </View>
      ) : (
        <View style={styles.listContent}>
          {logs.map((item) => (
            <View key={item._id} style={styles.logCard}>
              <View style={styles.logTop}>
                <Text style={styles.logVehicle}>{item.vehicleNumber || 'Unknown vehicle'}</Text>
                <Text style={styles.logLitres}>{item.litresPumped}L</Text>
              </View>
              <Text style={styles.logMeta}>
                {item.stationName || 'Unknown station'}
                {item.stationLocation ? ` - ${item.stationLocation}` : ''}
              </Text>
              <Text style={styles.logMeta}>
                {item.fuelType || 'Fuel'} - {new Date(item.date).toLocaleString()}
              </Text>
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

export default VehicleLogsScreen;
