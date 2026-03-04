import Constants from 'expo-constants';
// eslint-disable-next-line import/no-unresolved
import { API_URL as ENV_API_URL } from '@env';

const MOBILE_CLIENT_HEADERS = {
  'X-Client-Platform': 'mobile',
};

const DEFAULT_LOCAL_API_PORT = '5000';

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const resolveExpoHostUrl = () => {
  const hostSource = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || '';
  const [host] = String(hostSource || '').trim().split(':');

  return host ? `http://${host}:${DEFAULT_LOCAL_API_PORT}` : '';
};

export const API_BASE_URL = normalizeBaseUrl(ENV_API_URL) || resolveExpoHostUrl();

const getApiBaseUrlOrThrow = () => {
  if (!API_BASE_URL) {
    throw new Error('Mobile API URL is not configured. Set API_URL in fuelQuotaMobileApp/.env.');
  }

  return API_BASE_URL;
};

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrlOrThrow()}${normalizedPath}`;
};

export const buildMobileRequestConfig = (user, config = {}) => {
  const headers = {
    ...MOBILE_CLIENT_HEADERS,
    ...(config.headers || {}),
  };

  if (user?.token) {
    headers.Authorization = `Bearer ${user.token}`;
  }

  return {
    timeout: 15000,
    ...config,
    headers,
  };
};
