import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { buildApiUrl, buildMobileRequestConfig } from './apiConfig';
import {
  addLocalNotification,
  readLocalNotifications,
  upsertLocalNotifications,
} from './localNotifications';

const USER_STORAGE_KEY = 'user';

const normalizeDateTime = (value) => {
  const parsedDate = new Date(value || Date.now());
  return Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
};

const normalizeDataObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const normalizeVehiclePayload = (data = {}) => {
  const normalizedData = normalizeDataObject(data);
  const nestedVehicle = normalizeDataObject(normalizedData.vehicle);
  const vehicleId = String(
    normalizedData.vehicleId || nestedVehicle._id || normalizedData.vehicle || '',
  ).trim();
  const vehicleNumber = String(
    normalizedData.vehicleNumber || nestedVehicle.vehicleNumber || '',
  ).trim();

  if (!vehicleId && !vehicleNumber) {
    return null;
  }

  return {
    _id: vehicleId || undefined,
    vehicleNumber: vehicleNumber || undefined,
  };
};

const buildLocalNotificationFromExpo = (expoNotification = {}) => {
  const request = normalizeDataObject(expoNotification.request);
  const content = normalizeDataObject(request.content);
  const data = normalizeDataObject(content.data);
  const requestIdentifier = String(request.identifier || '').trim();
  const notificationId = String(data.notificationId || data._id || requestIdentifier || '').trim();
  const title = String(content.title || data.title || '').trim();
  const message = String(content.body || data.message || data.body || '').trim();

  if (!title && !message) {
    return null;
  }

  return {
    _id: notificationId || undefined,
    title: title || 'Notification',
    message,
    type: String(data.type || 'system_alert').trim().toLowerCase() || 'system_alert',
    status: String(data.status || 'completed').trim().toLowerCase() || 'completed',
    createdAt: normalizeDateTime(data.createdAt || expoNotification.date),
    isRead: Boolean(data.isRead),
    isDeliveredToDevice: true,
    vehicle: normalizeVehiclePayload(data),
  };
};

const resolveUserId = async (sessionUser) => {
  const sessionUserId = String(sessionUser?._id || '').trim();
  if (sessionUserId) {
    return sessionUserId;
  }

  try {
    const rawSessionUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (!rawSessionUser) {
      return '';
    }

    const parsedSessionUser = JSON.parse(rawSessionUser);
    return String(parsedSessionUser?._id || '').trim();
  } catch (error) {
    console.error('Failed to resolve session user for notification persistence:', error);
    return '';
  }
};

const persistExpoNotificationLocally = async (sessionUser, expoNotification) => {
  const localNotification = buildLocalNotificationFromExpo(expoNotification);
  if (!localNotification) {
    return { saved: false, reason: 'NOTIFICATION_EMPTY' };
  }

  const userId = await resolveUserId(sessionUser);
  if (!userId) {
    return { saved: false, reason: 'USER_MISSING' };
  }

  await addLocalNotification(userId, localNotification, { notifyDevice: false });

  return {
    saved: true,
    notificationId: String(localNotification._id || '').trim(),
    userId,
  };
};

const syncRemoteNotificationsToLocal = async (sessionUser) => {
  const userId = await resolveUserId(sessionUser);
  if (!userId) {
    return [];
  }

  const localNotifications = await readLocalNotifications(userId);
  if (!sessionUser?.token) {
    return localNotifications;
  }

  const response = await axios.get(
    buildApiUrl('/api/notifications/mine'),
    buildMobileRequestConfig(sessionUser),
  );
  const remoteNotifications = Array.isArray(response.data) ? response.data : [];

  return upsertLocalNotifications(userId, remoteNotifications);
};

export { buildLocalNotificationFromExpo, persistExpoNotificationLocally, syncRemoteNotificationsToLocal };
