import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import { useAppToast } from '../../../context/ToastContext';
import { AppTheme } from '../../../constants/Colors';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import { showUnreadNotificationPopup } from '../../../utils/notificationPopup';
import ActionCard from '../../Components/UI/ActionCard';
import MetricCard from '../../Components/UI/MetricCard';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';

const { colors, spacing, radius, shadow } = AppTheme;

const VehicleHomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const { showToast } = useAppToast();
  const [vehicles, setVehicles] = useState(() => user?.vehicles || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const rootNavigation = navigation.getParent?.() || navigation;

  const loadDashboard = useCallback(async () => {
    if (!user) {
      setVehicles([]);
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
      setVehicles(response.data || []);
    } catch (fetchError) {
      console.error('Error fetching vehicle dashboard data:', fetchError);
      setVehicles(user?.vehicles || []);
      setError(fetchError.response?.data?.message || 'Failed to load dashboard details.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const hydrateScreen = async () => {
        setIsLoading(true);
        await loadDashboard();

        if (!isActive) {
          return;
        }

        try {
          await showUnreadNotificationPopup(user, showToast);
        } catch (notificationError) {
          console.error('Error showing notifications:', notificationError);
        }
      };

      hydrateScreen();

      return () => {
        isActive = false;
      };
    }, [loadDashboard, showToast, user]),
  );

  const totalRemainingQuota = useMemo(
    () => vehicles.reduce((sum, vehicle) => sum + Number(vehicle.remainingQuota || 0), 0),
    [vehicles],
  );

  const openVehicleLogs = useCallback(() => {
    rootNavigation.navigate('vehicleLogs');
  }, [rootNavigation]);

  return (
    <ScreenShell
      badge="Vehicle"
      title="My vehicles"
      subtitle="Quick access to register vehicles, check quota, and open fuel QR."
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Vehicles" value={`${vehicles.length}`} style={styles.metricCard} />
        <MetricCard label="Remaining quota" value={`${totalRemainingQuota}L`} style={styles.metricCard} />
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader
          badge="Quick Actions"
          title="Common tasks"
          subtitle="Shortcuts for the actions you use most."
        />
        <View style={styles.actionGrid}>
          <ActionCard
            mark="RG"
            title="Register vehicle"
            description="Add a new vehicle record."
            onPress={() => navigation.navigate('vehicleRegister')}
            style={styles.actionCard}
          />
          <ActionCard
            mark="QR"
            title="Vehicle details"
            description="Open vehicle details and QR code."
            tone="teal"
            onPress={() => navigation.navigate('vehicleQr')}
            style={styles.actionCard}
          />
          <ActionCard
            mark="QT"
            title="Check quota"
            description="View available quota by vehicle."
            tone="dark"
            onPress={() => navigation.navigate('vehicleQuota')}
            style={styles.actionCard}
          />
          <ActionCard
            mark="LG"
            title="View logs"
            description="Review recent fuel history."
            tone="teal"
            onPress={openVehicleLogs}
            style={styles.actionCard}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>Loading your dashboard...</Text>
        </View>
      ) : error ? (
        <View style={[styles.feedbackCard, styles.errorCard]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : vehicles.length === 0 ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>No vehicles connected yet</Text>
          <Text style={styles.feedbackText}>
            Register your first vehicle to get fuel quota and QR access.
          </Text>
        </View>
      ) : null}
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
  actionGrid: {
    gap: spacing.md,
  },
  actionCard: {
    backgroundColor: colors.surfaceStrong,
  },
  feedbackCard: {
    gap: spacing.xs,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
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
    lineHeight: 21,
  },
  errorCard: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(220, 76, 63, 0.16)',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },
});

export default VehicleHomeScreen;
