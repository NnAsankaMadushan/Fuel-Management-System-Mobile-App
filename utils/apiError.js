export const getApiErrorMessage = (error, fallbackMessage, networkMessage = fallbackMessage) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED' || error?.message === 'Network Error') {
    return networkMessage;
  }

  return fallbackMessage;
};
