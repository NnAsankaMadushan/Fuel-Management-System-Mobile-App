import Constants from 'expo-constants';
// eslint-disable-next-line import/no-unresolved
import { API_URL as ENV_API_URL } from '@env';

const MOBILE_CLIENT_HEADERS = {
  'X-Client-Platform': 'mobile',
};

const DEFAULT_LOCAL_API_PORT = '5000';
const LOCAL_NETWORK_HOST_REGEX = /^(localhost|127\.\d+\.\d+\.\d+|10\.0\.2\.2|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)$/;
const LOOPBACK_OR_EMULATOR_HOST_REGEX = /^(localhost|127\.\d+\.\d+\.\d+|10\.0\.2\.2)$/;

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');
const getHostname = (value) => {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) return '';

  const withoutProtocol = normalized.replace(/^https?:\/\//i, '');
  const [hostPortSegment = ''] = withoutProtocol.split('/');
  const [host = ''] = hostPortSegment.split(':');

  return host.trim();
};
const isLocalNetworkHost = (host) => LOCAL_NETWORK_HOST_REGEX.test(String(host || '').trim());

const resolveExpoHostUrl = () => {
  const hostSource = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || '';
  const [host] = String(hostSource || '').trim().split(':');

  return host ? `http://${host}:${DEFAULT_LOCAL_API_PORT}` : '';
};

const envBaseUrl = normalizeBaseUrl(ENV_API_URL);
const expoHostBaseUrl = resolveExpoHostUrl();
const envHost = getHostname(envBaseUrl);
const expoHost = getHostname(expoHostBaseUrl);
const expoHostIsDeviceReachable = isLocalNetworkHost(expoHost) && !LOOPBACK_OR_EMULATOR_HOST_REGEX.test(expoHost);
const shouldPreferExpoHost =
  __DEV__ &&
  expoHostBaseUrl &&
  expoHostIsDeviceReachable &&
  (!envBaseUrl || (isLocalNetworkHost(envHost) && envHost !== expoHost));

export const API_BASE_URL = shouldPreferExpoHost ? expoHostBaseUrl : envBaseUrl || expoHostBaseUrl;

if (__DEV__) {
  console.log(
    `[apiConfig] ENV_API_URL=${envBaseUrl || 'unset'} | EXPO_HOST_API_URL=${
      expoHostBaseUrl || 'unset'
    } | API_BASE_URL=${API_BASE_URL || 'unset'}`,
  );
}

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
