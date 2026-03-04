import React, { useCallback, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useUser } from '../../../context/UserContext';
import { AppTheme } from '../../../constants/Colors';
import { buildApiUrl, buildMobileRequestConfig } from '../../../utils/apiConfig';
import ActionCard from '../../Components/UI/ActionCard';
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

const formatNotificationTime = (value) =>
  new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const applyNotificationRead = (notifications, notificationId) =>
  notifications.map((notification) =>
    notification._id === notificationId ? { ...notification, isRead: true } : notification
  );

const VehicleHomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const [vehicles, setVehicles] = useState(() => user?.vehicles || []);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [notificationActionId, setNotificationActionId] = useState('');

  const rootNavigation = navigation.getParent?.() || navigation;

  const loadDashboard = useCallback(async () => {
    if (!user) {
      setVehicles([]);
      setNotifications([]);
      setIsLoading(false);
      setIsNotificationLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsNotificationLoading(true);

      const requestConfig = buildMobileRequestConfig(user);
      const [vehicleResult, notificationResult] = await Promise.allSettled([
        axios.get(buildApiUrl('/api/vehicles/mine'), requestConfig),
        axios.get(buildApiUrl('/api/notifications/mine'), requestConfig),
      ]);

      if (vehicleResult.status === 'fulfilled') {
        setVehicles(vehicleResult.value.data || []);
      } else {
        console.error('Error fetching vehicle data:', vehicleResult.reason);
        setVehicles(user?.vehicles || []);
      }

      if (notificationResult.status === 'fulfilled') {
        setNotifications(notificationResult.value.data || []);
      } else {
        console.error('Error fetching notifications:', notificationResult.reason);
        setNotifications([]);
      }
    } finally {
      setIsLoading(false);
      setIsNotificationLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      if (!user) {
        return;
      }

      try {
        setNotificationActionId(notificationId);
        await axios.patch(
          buildApiUrl(`/api/notifications/${notificationId}/read`),
          {},
          buildMobileRequestConfig(user),
        );
        setNotifications((current) => applyNotificationRead(current, notificationId));
      } catch (error) {
        console.error('Error marking notification as read:', error);
        Alert.alert('Error', error.response?.data?.message || 'Failed to mark the notification as read.');
      } finally {
        setNotificationActionId('');
      }
    },
    [user],
  );

  const openVehicleDetails = useCallback(
    (vehicleId) => {
      setIsNotificationModalVisible(false);
      rootNavigation.navigate('vehicleDetails', { vehicleId });
    },
    [rootNavigation],
  );

  const openVehicleLogs = useCallback(() => {
    rootNavigation.navigate('vehicleLogs');
  }, [rootNavigation]);

  const totalRemainingQuota = vehicles.reduce((sum, vehicle) => sum + Number(vehicle.remainingQuota || 0), 0);
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

  return (
    <>
      <ScreenShell
        badge="Vehicle"
        title="My vehicles"
        subtitle="View quota, logs, approval status, and vehicle details."
        headerAction={(
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              unreadNotifications > 0
                ? `${unreadNotifications} unread notifications`
                : 'Open notifications'
            }
            onPress={() => setIsNotificationModalVisible(true)}
            style={({ pressed }) => [
              styles.notificationButton,
              pressed ? styles.notificationButtonPressed : null,
            ]}
          >
            <FontAwesome name="bell-o" size={20} color={colors.text} />
            {unreadNotifications > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            ) : null}
          </Pressable>
        )}
      >
        <View style={styles.metricGrid}>
          <MetricCard label="Vehicles" value={`${vehicles.length}`} style={styles.metricCard} />
          <MetricCard label="Remaining quota" value={`${totalRemainingQuota}L`} style={styles.metricCard} />
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader badge="Quick Actions" title="Common tasks" />
          <View style={styles.actionGrid}>
            <ActionCard
              mark="RG"
              title="Register vehicle"
              description="Add a new vehicle record."
              onPress={() => navigation.navigate('vehicleRegister')}
              style={styles.actionCard}
            />
            <ActionCard
              mark="LG"
              title="View logs"
              description="Review your recent fuel history."
              tone="teal"
              onPress={openVehicleLogs}
              style={styles.actionCard}
            />
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader badge="Notifications" title="Approval updates" />

          {isNotificationLoading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Loading notifications...</Text>
              <Text style={styles.emptyText}>Checking your latest approval updates.</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No approval notifications yet</Text>
              <Text style={styles.emptyText}>
                Updates will appear here after an admin reviews your vehicles.
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <View
                key={notification._id}
                style={[
                  styles.notificationCard,
                  notification.isRead ? styles.notificationCardRead : null,
                ]}
              >
                <View style={styles.notificationMeta}>
                  <StatusChip
                    label={formatStatus(notification.status)}
                    tone={getStatusTone(notification.status)}
                  />
                  {!notification.isRead ? (
                    <View style={styles.notificationNewTag}>
                      <Text style={styles.notificationNewTagText}>New</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{formatNotificationTime(notification.createdAt)}</Text>

                <View style={styles.buttonRow}>
                  {notification.vehicle?._id ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => openVehicleDetails(notification.vehicle._id)}
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed ? styles.buttonPressed : null,
                      ]}
                    >
                      <Text style={styles.secondaryButtonText}>Open vehicle</Text>
                    </Pressable>
                  ) : null}

                  {!notification.isRead ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleMarkAsRead(notification._id)}
                      disabled={notificationActionId === notification._id}
                      style={({ pressed }) => [
                        styles.ghostButton,
                        pressed ? styles.buttonPressed : null,
                        notificationActionId === notification._id ? styles.buttonDisabled : null,
                      ]}
                    >
                      <Text style={styles.ghostButtonText}>
                        {notificationActionId === notification._id ? 'Saving...' : 'Mark as read'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader badge="Vehicles" title="Registered vehicles" />
        </View>

        {isLoading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Loading vehicles...</Text>
            <Text style={styles.emptyText}>Your latest vehicle data is being refreshed.</Text>
          </View>
        ) : vehicles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No vehicles connected yet</Text>
            <Text style={styles.emptyText}>Your registered vehicles will appear here.</Text>
          </View>
        ) : (
          vehicles.map((vehicle) => {
            const status = getVehicleStatus(vehicle);
            const quotaPercent = vehicle.allocatedQuota
              ? Math.round((Number(vehicle.remainingQuota || 0) / Number(vehicle.allocatedQuota || 1)) * 100)
              : 0;

            return (
              <View key={vehicle._id} style={styles.vehicleCard}>
                <View style={styles.vehicleTop}>
                  <View style={styles.vehicleCopy}>
                    <View style={styles.vehicleHeading}>
                      <Text style={styles.vehicleTitle}>{vehicle.vehicleNumber}</Text>
                      <StatusChip label={formatStatus(status)} tone={getStatusTone(status)} />
                    </View>
                    <Text style={styles.vehicleMeta}>{vehicle.vehicleType || 'Vehicle type unavailable'}</Text>
                    {status !== 'approved' && status !== 'verified' ? (
                      <Text style={[
                        styles.vehicleStatusNote,
                        status === 'rejected' ? styles.vehicleStatusRejected : styles.vehicleStatusPending,
                      ]}>
                        {vehicle.approvalNote ||
                          (status === 'pending'
                            ? 'Waiting for admin approval before fuel quota can be used.'
                            : 'This vehicle has been rejected. Check the latest admin note.')}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.vehicleProgress}>
                    <Text style={styles.vehicleProgressValue}>{vehicle.remainingQuota || 0}L</Text>
                    <Text style={styles.vehicleProgressMeta}>{quotaPercent}% left</Text>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.max(0, Math.min(quotaPercent, 100))}%` },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.vehicleStats}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Allocated</Text>
                    <Text style={styles.statValue}>{vehicle.allocatedQuota || 0}L</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Remaining</Text>
                    <Text style={styles.statValue}>{vehicle.remainingQuota || 0}L</Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => openVehicleDetails(vehicle._id)}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    styles.vehicleDetailsButton,
                    pressed ? styles.buttonPressed : null,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>Details</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScreenShell>

      <Modal
        transparent
        animationType="slide"
        visible={isNotificationModalVisible}
        onRequestClose={() => setIsNotificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsNotificationModalVisible(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalCopy}>
                <Text style={styles.modalEyebrow}>Notifications</Text>
                <Text style={styles.modalTitle}>Approval updates</Text>
                <Text style={styles.modalSubtitle}>
                  {unreadNotifications > 0
                    ? `${unreadNotifications} unread update${unreadNotifications === 1 ? '' : 's'}`
                    : 'All caught up.'}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
                onPress={() => setIsNotificationModalVisible(false)}
                style={({ pressed }) => [
                  styles.modalCloseButton,
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                <FontAwesome name="close" size={18} color={colors.text} />
              </Pressable>
            </View>

            {isNotificationLoading ? (
              <View style={styles.modalStateCard}>
                <Text style={styles.emptyTitle}>Loading notifications...</Text>
                <Text style={styles.emptyText}>Checking your latest approval updates.</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.modalStateCard}>
                <Text style={styles.emptyTitle}>No notifications yet</Text>
                <Text style={styles.emptyText}>
                  Approval updates will appear here after an admin reviews your vehicles.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {notifications.map((notification) => (
                  <View
                    key={notification._id}
                    style={[
                      styles.notificationCard,
                      notification.isRead ? styles.notificationCardRead : null,
                    ]}
                  >
                    <View style={styles.notificationMeta}>
                      <StatusChip
                        label={formatStatus(notification.status)}
                        tone={getStatusTone(notification.status)}
                      />
                      {notification.vehicle?.vehicleNumber ? (
                        <View style={styles.notificationTag}>
                          <Text style={styles.notificationTagText}>
                            {notification.vehicle.vehicleNumber}
                          </Text>
                        </View>
                      ) : null}
                      {!notification.isRead ? (
                        <View style={styles.notificationNewTag}>
                          <Text style={styles.notificationNewTagText}>New</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>
                      {formatNotificationTime(notification.createdAt)}
                    </Text>

                    <View style={styles.buttonRow}>
                      {notification.vehicle?._id ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => openVehicleDetails(notification.vehicle._id)}
                          style={({ pressed }) => [
                            styles.secondaryButton,
                            pressed ? styles.buttonPressed : null,
                          ]}
                        >
                          <Text style={styles.secondaryButtonText}>Open vehicle</Text>
                        </Pressable>
                      ) : null}

                      {!notification.isRead ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => handleMarkAsRead(notification._id)}
                          disabled={notificationActionId === notification._id}
                          style={({ pressed }) => [
                            styles.ghostButton,
                            pressed ? styles.buttonPressed : null,
                            notificationActionId === notification._id ? styles.buttonDisabled : null,
                          ]}
                        >
                          <Text style={styles.ghostButtonText}>
                            {notificationActionId === notification._id ? 'Saving...' : 'Mark as read'}
                          </Text>
                        </Pressable>
                      ) : (
                        <Text style={styles.notificationReadNote}>Marked as read</Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
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
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  notificationButtonPressed: {
    transform: [{ translateY: -1 }],
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyCard: {
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  notificationCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  notificationCardRead: {
    opacity: 0.82,
  },
  notificationMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  notificationTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationTagText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  notificationNewTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  notificationNewTagText: {
    color: colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  notificationTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  notificationMessage: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  notificationTime: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  secondaryButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  ghostButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  ghostButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  buttonPressed: {
    transform: [{ translateY: -1 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  vehicleCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  vehicleTop: {
    gap: spacing.md,
  },
  vehicleCopy: {
    gap: spacing.xs,
  },
  vehicleHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vehicleTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  vehicleMeta: {
    color: colors.textMuted,
    fontSize: 14,
  },
  vehicleStatusNote: {
    fontSize: 14,
    lineHeight: 21,
  },
  vehicleStatusPending: {
    color: colors.accentStrong,
  },
  vehicleStatusRejected: {
    color: colors.danger,
  },
  vehicleProgress: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehicleProgressValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  vehicleProgressMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  vehicleStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    marginTop: 2,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  vehicleDetailsButton: {
    alignSelf: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.overlay,
  },
  modalCard: {
    maxHeight: '80%',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  modalEyebrow: {
    color: colors.accentStrong,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalStateCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalScroll: {
    maxHeight: 440,
  },
  modalScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  notificationReadNote: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default VehicleHomeScreen;
