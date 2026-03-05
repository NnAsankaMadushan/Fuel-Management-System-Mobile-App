import { markLocalNotificationAsRead, readLocalNotifications } from './localNotifications';

const SUPPORTED_NOTIFICATION_ROLES = new Set([
  'vehicle_owner',
  'station_owner',
  'station_operator',
]);

export const roleSupportsNotificationPopup = (role) =>
  SUPPORTED_NOTIFICATION_ROLES.has(String(role || '').trim().toLowerCase());

const shownNotificationIdsByUser = new Map();

const getSeenNotificationsForUser = (userId) => {
  const key = String(userId || '').trim();
  if (!key) {
    return new Set();
  }

  if (!shownNotificationIdsByUser.has(key)) {
    shownNotificationIdsByUser.set(key, new Set());
  }

  return shownNotificationIdsByUser.get(key);
};

export const showUnreadNotificationPopup = async (user, showToast) => {
  if (!user?._id || !roleSupportsNotificationPopup(user?.role)) {
    return null;
  }

  const notifications = await readLocalNotifications(user._id);

  const seenNotificationIds = getSeenNotificationsForUser(user?._id);
  const unreadNotification = notifications.find(
    (notification) =>
      notification &&
      !notification.isRead &&
      notification._id &&
      !seenNotificationIds.has(notification._id),
  );

  if (!unreadNotification?._id) {
    return null;
  }

  seenNotificationIds.add(unreadNotification._id);

  if (typeof showToast === 'function') {
    showToast({
      title: unreadNotification.title || 'Notification',
      message: unreadNotification.message || 'You have a new update.',
      type: 'info',
      duration: 5200,
    });
  }

  try {
    await markLocalNotificationAsRead(user._id, unreadNotification._id);
  } catch (error) {
    seenNotificationIds.delete(unreadNotification._id);
    throw error;
  }

  return {
    ...unreadNotification,
    isRead: true,
  };
};
