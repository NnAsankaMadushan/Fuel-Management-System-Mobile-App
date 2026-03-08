import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendDeviceNotification } from './deviceNotifications';

const STORAGE_PREFIX = 'fuelplus_local_notifications';
const MAX_NOTIFICATIONS = 200;

const buildStorageKey = (userId) => `${STORAGE_PREFIX}:${String(userId || '').trim()}`;

const parseNotificationList = (rawValue) => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error('Failed to parse local notifications:', error);
    return [];
  }
};

const normalizeNotification = (notification = {}) => {
  const createdAt = notification.createdAt || new Date().toISOString();
  const notificationId =
    notification._id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return {
    _id: notificationId,
    title: String(notification.title || 'Notification'),
    message: String(notification.message || ''),
    type: String(notification.type || 'fuel_transaction'),
    status: String(notification.status || 'completed'),
    isRead: Boolean(notification.isRead),
    isDeliveredToDevice: Boolean(notification.isDeliveredToDevice),
    createdAt,
    vehicle: notification.vehicle || null,
  };
};

const sortByNewest = (notifications) =>
  [...notifications].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

const readLocalNotifications = async (userId) => {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) {
    return [];
  }

  const rawValue = await AsyncStorage.getItem(buildStorageKey(normalizedUserId));
  return sortByNewest(parseNotificationList(rawValue).map(normalizeNotification));
};

const writeLocalNotifications = async (userId, notifications = []) => {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) {
    return [];
  }

  const normalizedList = sortByNewest(
    notifications.map((notification) => normalizeNotification(notification)),
  ).slice(0, MAX_NOTIFICATIONS);

  await AsyncStorage.setItem(buildStorageKey(normalizedUserId), JSON.stringify(normalizedList));
  return normalizedList;
};

const upsertLocalNotifications = async (userId, notifications = []) => {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) {
    return [];
  }

  const mergedById = new Map();

  for (const currentNotification of await readLocalNotifications(normalizedUserId)) {
    const normalizedCurrent = normalizeNotification(currentNotification);
    mergedById.set(normalizedCurrent._id, normalizedCurrent);
  }

  for (const incomingNotification of Array.isArray(notifications) ? notifications : []) {
    const normalizedIncoming = normalizeNotification(incomingNotification);
    mergedById.set(normalizedIncoming._id, normalizedIncoming);
  }

  return writeLocalNotifications(normalizedUserId, [...mergedById.values()]);
};

const markLocalNotificationAsDelivered = async (userId, notificationId) => {
  const normalizedNotificationId = String(notificationId || '').trim();
  if (!normalizedNotificationId) {
    return { notifications: await readLocalNotifications(userId), updated: false };
  }

  let updated = false;
  const nextNotifications = (await readLocalNotifications(userId)).map((notification) => {
    if (notification._id !== normalizedNotificationId || notification.isDeliveredToDevice) {
      return notification;
    }

    updated = true;
    return {
      ...notification,
      isDeliveredToDevice: true,
    };
  });

  return {
    notifications: await writeLocalNotifications(userId, nextNotifications),
    updated,
  };
};

const addLocalNotification = async (
  userId,
  notification = {},
  { notifyDevice = true } = {},
) => {
  const currentNotifications = await readLocalNotifications(userId);
  const nextNotification = normalizeNotification(notification);
  const deduplicatedNotifications = currentNotifications.filter(
    (entry) => entry._id !== nextNotification._id,
  );

  const savedNotifications = await writeLocalNotifications(userId, [
    nextNotification,
    ...deduplicatedNotifications,
  ]);

  if (!notifyDevice) {
    return savedNotifications;
  }

  try {
    const deliveryResult = await sendDeviceNotification({
      title: nextNotification.title,
      body: nextNotification.message,
      data: {
        notificationId: nextNotification._id,
        type: nextNotification.type,
        status: nextNotification.status,
      },
    });

    if (deliveryResult?.scheduled) {
      const { notifications: deliveredNotifications } = await markLocalNotificationAsDelivered(
        userId,
        nextNotification._id,
      );
      return deliveredNotifications;
    }
  } catch (error) {
    console.error('Failed to deliver local notification to device:', error);
  }

  return savedNotifications;
};

const markLocalNotificationAsRead = async (userId, notificationId) => {
  const normalizedNotificationId = String(notificationId || '').trim();
  if (!normalizedNotificationId) {
    return { notifications: await readLocalNotifications(userId), updated: false };
  }

  let updated = false;
  const nextNotifications = (await readLocalNotifications(userId)).map((notification) => {
    if (notification._id !== normalizedNotificationId || notification.isRead) {
      return notification;
    }

    updated = true;
    return {
      ...notification,
      isRead: true,
    };
  });

  return {
    notifications: await writeLocalNotifications(userId, nextNotifications),
    updated,
  };
};

const markAllLocalNotificationsAsRead = async (userId) => {
  let modifiedCount = 0;
  const nextNotifications = (await readLocalNotifications(userId)).map((notification) => {
    if (notification.isRead) {
      return notification;
    }

    modifiedCount += 1;
    return {
      ...notification,
      isRead: true,
    };
  });

  return {
    notifications: await writeLocalNotifications(userId, nextNotifications),
    modifiedCount,
  };
};

export {
  addLocalNotification,
  markAllLocalNotificationsAsRead,
  markLocalNotificationAsDelivered,
  markLocalNotificationAsRead,
  readLocalNotifications,
  upsertLocalNotifications,
};
