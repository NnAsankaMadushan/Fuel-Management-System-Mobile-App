const MOBILE_CLIENT_HEADERS = {
  'X-Client-Platform': 'mobile',
};

const API_URL = 'http://192.168.43.27:5000';

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');
export const API_BASE_URL = normalizeBaseUrl(API_URL);

if (__DEV__) {
  console.log(`[apiConfig] API_BASE_URL=${API_BASE_URL || 'unset'}`);
}

const getApiBaseUrlOrThrow = () => {
  if (!API_BASE_URL) {
    throw new Error('Mobile API URL is not configured.');
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
