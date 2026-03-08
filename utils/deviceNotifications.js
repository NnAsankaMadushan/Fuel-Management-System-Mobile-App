import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const DEFAULT_CHANNEL_ID = 'fuelplus-default';
const DEFAULT_CHANNEL_NAME = 'FuelPlus Alerts';

let permissionInitialized = false;
let cachedPermissionGranted = false;

const getNotificationErrorMessage = (error) =>
  String(error?.message || error || '').trim();

const isRecoverablePushTokenError = (error) => {
  const normalizedMessage = getNotificationErrorMessage(error).toUpperCase();
  const normalizedCode = String(error?.code || '').trim().toUpperCase();
  const knownRecoverableFragments = [
    'SERVICE_NOT_AVAILABLE',
    'FETCHING THE TOKEN FAILED',
    'TIMEOUT',
    'TIMED OUT',
    'AUTHENTICATION_FAILED',
    'UNKNOWN_HOST',
    'NETWORK',
    'JAVA.IO.IOEXCEPTION',
  ];

  return knownRecoverableFragments.some(
    (fragment) => normalizedMessage.includes(fragment) || normalizedCode.includes(fragment),
  );
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const configureAndroidChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: DEFAULT_CHANNEL_NAME,
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 180, 120, 180],
    lightColor: '#F97316',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
  });
};

const ensureDeviceNotificationAccess = async ({ forcePrompt = false } = {}) => {
  await configureAndroidChannel();

  if (permissionInitialized && cachedPermissionGranted && !forcePrompt) {
    return {
      granted: true,
      status: 'granted',
    };
  }

  const existingPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermissions.status;

  if ((finalStatus !== 'granted' || forcePrompt) && existingPermissions.canAskAgain !== false) {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  const granted = finalStatus === 'granted';
  permissionInitialized = true;
  cachedPermissionGranted = granted;

  return {
    granted,
    status: finalStatus,
  };
};

const getExpoPushToken = async () => {
  try {
    const permission = await ensureDeviceNotificationAccess();
    if (!permission.granted) {
      return { token: '', reason: 'NOTIFICATION_PERMISSION_DENIED' };
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId ||
      '';

    if (!projectId) {
      return { token: '', reason: 'EXPO_PROJECT_ID_MISSING' };
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = String(tokenResponse?.data || '').trim();

    if (!token) {
      return { token: '', reason: 'EXPO_PUSH_TOKEN_EMPTY' };
    }

    return { token };
  } catch (error) {
    const recoverable = isRecoverablePushTokenError(error);

    return {
      token: '',
      reason: recoverable ? 'EXPO_PUSH_TOKEN_UNAVAILABLE' : 'EXPO_PUSH_TOKEN_FETCH_FAILED',
      recoverable,
      errorCode: String(error?.code || '').trim() || undefined,
      errorMessage: getNotificationErrorMessage(error) || undefined,
    };
  }
};

const sendDeviceNotification = async ({
  title,
  body,
  data = {},
  channelId = DEFAULT_CHANNEL_ID,
} = {}) => {
  const normalizedTitle = String(title || '').trim();
  const normalizedBody = String(body || '').trim();

  if (!normalizedTitle && !normalizedBody) {
    return { scheduled: false, reason: 'NOTIFICATION_EMPTY' };
  }

  const permission = await ensureDeviceNotificationAccess();
  if (!permission.granted) {
    return { scheduled: false, reason: 'NOTIFICATION_PERMISSION_DENIED' };
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: normalizedTitle || 'FuelPlus',
      body: normalizedBody,
      data,
      channelId,
      sound: 'default',
    },
    trigger: null,
  });

  return { scheduled: true };
};

export { ensureDeviceNotificationAccess, getExpoPushToken, sendDeviceNotification };
