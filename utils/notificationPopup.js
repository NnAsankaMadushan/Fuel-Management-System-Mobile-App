import { markLocalNotificationAsDelivered, readLocalNotifications } from './localNotifications';
import { sendDeviceNotification } from './deviceNotifications';
import { syncRemoteNotificationsToLocal } from './notificationSync';

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

export const showUnreadNotificationPopup = async (user) => {
  if (!user?._id || !roleSupportsNotificationPopup(user?.role)) {
    return null;
  }

  let notifications = [];

  if (user?.token) {
    try {
      notifications = await syncRemoteNotificationsToLocal(user);
    } catch (error) {
      console.error('Failed to sync remote notifications before popup display:', error);
      notifications = await readLocalNotifications(user._id);
    }
  } else {
    notifications = await readLocalNotifications(user._id);
  }

  const seenNotificationIds = getSeenNotificationsForUser(user?._id);
  const unreadNotification = notifications.find(
    (notification) =>
      notification &&
      !notification.isRead &&
      !notification.isDeliveredToDevice &&
      notification._id &&
      !seenNotificationIds.has(notification._id),
  );

  if (!unreadNotification?._id) {
    return null;
  }

  seenNotificationIds.add(unreadNotification._id);

  try {
    const deliveryResult = await sendDeviceNotification({
      title: unreadNotification.title || 'Notification',
      body: unreadNotification.message || 'You have a new update.',
      data: {
        notificationId: unreadNotification._id,
        type: unreadNotification.type,
        status: unreadNotification.status,
      },
    });

    if (!deliveryResult?.scheduled) {
      seenNotificationIds.delete(unreadNotification._id);
      return null;
    }

    await markLocalNotificationAsDelivered(user._id, unreadNotification._id);
  } catch (error) {
    seenNotificationIds.delete(unreadNotification._id);
    throw error;
  }

  return {
    ...unreadNotification,
    isDeliveredToDevice: true,
  };
};
