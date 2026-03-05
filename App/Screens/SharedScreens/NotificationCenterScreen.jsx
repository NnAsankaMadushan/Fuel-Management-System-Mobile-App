import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../../../context/UserContext';
import { AppTheme } from '../../../constants/Colors';
import { markAllLocalNotificationsAsRead, readLocalNotifications } from '../../../utils/localNotifications';
import ScreenShell from '../../Components/UI/ScreenShell';
import SectionHeader from '../../Components/UI/SectionHeader';

const { colors, spacing, radius, shadow } = AppTheme;

const statusStyles = {
  completed: {
    label: 'Completed',
    textColor: colors.success,
    chipBg: colors.successSoft,
    barColor: colors.success,
  },
  approved: {
    label: 'Approved',
    textColor: colors.success,
    chipBg: colors.successSoft,
    barColor: colors.success,
  },
  pending: {
    label: 'Pending',
    textColor: colors.accentStrong,
    chipBg: colors.accentSoft,
    barColor: colors.accent,
  },
  rejected: {
    label: 'Rejected',
    textColor: colors.danger,
    chipBg: colors.dangerSoft,
    barColor: colors.danger,
  },
};

const getStatusStyle = (status) => {
  const normalizedStatus = String(status || 'pending').toLowerCase();
  return statusStyles[normalizedStatus] || statusStyles.pending;
};

const formatDateTime = (value) =>
  new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const NotificationCenterScreen = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      setError('');
      const notificationList = await readLocalNotifications(user?._id);
      setNotifications(notificationList);

      const unreadNotificationIds = notificationList
        .filter((notification) => notification && !notification.isRead && notification._id)
        .map((notification) => notification._id);

      if (unreadNotificationIds.length) {
        await markAllLocalNotificationsAsRead(user?._id);

        const readIdSet = new Set(unreadNotificationIds);
        setNotifications((current) =>
          current.map((notification) =>
            readIdSet.has(notification._id)
              ? { ...notification, isRead: true }
              : notification,
          ),
        );
      }
    } catch (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      setError(fetchError.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadNotifications();
    }, [loadNotifications]),
  );

  return (
    <ScreenShell
      badge="Notifications"
      title="Notification center"
    >
      <View style={styles.sectionBlock}>
        <SectionHeader
          badge="Timeline"
          title="Recent notifications"
          subtitle="Read, review, and clear important alerts."
        />

        {isLoading ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>Loading notifications...</Text>
          </View>
        ) : error ? (
          <View style={[styles.feedbackCard, styles.errorCard]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>No notifications available.</Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const style = getStatusStyle(notification.status);

            return (
              <View
                key={notification._id}
                style={[
                  styles.notificationCard,
                  notification.isRead ? styles.notificationCardRead : null,
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.statusChip, { backgroundColor: style.chipBg }]}>
                    <Text style={[styles.statusChipText, { color: style.textColor }]}>
                      {style.label}
                    </Text>
                  </View>
                  <Text style={styles.timeText}>{formatDateTime(notification.createdAt)}</Text>
                </View>

                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>

                <View style={styles.cardBottom}>
                  {notification.vehicle?.vehicleNumber ? (
                    <Text style={styles.vehicleTag}>{notification.vehicle.vehicleNumber}</Text>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
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
  notificationCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  notificationCardRead: {
    opacity: 0.78,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  notificationTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  notificationMessage: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  vehicleTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
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

export default NotificationCenterScreen;
