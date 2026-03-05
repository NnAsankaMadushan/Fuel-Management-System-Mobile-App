import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { AppTheme } from '../constants/Colors';

const { colors, spacing, radius, shadow } = AppTheme;

const toastStyles = {
  info: {
    backgroundColor: 'rgba(24, 33, 47, 0.92)',
    accentColor: colors.accent,
    titleColor: colors.textOnDark,
    messageColor: 'rgba(248, 250, 252, 0.86)',
  },
  success: {
    backgroundColor: 'rgba(29, 139, 95, 0.94)',
    accentColor: '#9ae6c7',
    titleColor: colors.white,
    messageColor: 'rgba(255, 255, 255, 0.88)',
  },
  error: {
    backgroundColor: 'rgba(220, 76, 63, 0.96)',
    accentColor: '#ffd2cd',
    titleColor: colors.white,
    messageColor: 'rgba(255, 255, 255, 0.9)',
  },
};

const DEFAULT_DURATION_MS = 4200;
const MAX_TOASTS = 3;

const ToastContext = createContext({
  showToast: () => {},
  hideToast: () => {},
});

const buildToastId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeToastInput = (input, options = {}) => {
  if (typeof input === 'string') {
    return {
      title: options.title || 'Notice',
      message: input,
      type: options.type || 'info',
      duration: Number(options.duration) || DEFAULT_DURATION_MS,
    };
  }

  return {
    title: input?.title || 'Notice',
    message: input?.message || '',
    type: input?.type || 'info',
    duration: Number(input?.duration) || DEFAULT_DURATION_MS,
  };
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const hideToast = useCallback((toastId) => {
    if (!toastId) {
      return;
    }

    const activeTimer = timersRef.current.get(toastId);
    if (activeTimer) {
      globalThis.clearTimeout(activeTimer);
      timersRef.current.delete(toastId);
    }

    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const showToast = useCallback(
    (input, options = {}) => {
      const normalized = normalizeToastInput(input, options);

      if (!normalized.message) {
        return '';
      }

      const toastId = buildToastId();
      const toast = {
        id: toastId,
        ...normalized,
      };

      setToasts((current) => [...current, toast].slice(-MAX_TOASTS));

      if (Platform.OS === 'android') {
        const toastCopy = normalized.title
          ? `${normalized.title}: ${normalized.message}`
          : normalized.message;
        ToastAndroid.show(toastCopy, ToastAndroid.LONG);
      }

      const timer = globalThis.setTimeout(() => {
        hideToast(toastId);
      }, normalized.duration);

      timersRef.current.set(toastId, timer);
      return toastId;
    },
    [hideToast],
  );

  const contextValue = useMemo(
    () => ({
      showToast,
      hideToast,
    }),
    [hideToast, showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <View pointerEvents="box-none" style={styles.host}>
        {toasts.map((toast) => {
          const tone = toastStyles[toast.type] || toastStyles.info;

          return (
            <View
              key={toast.id}
              style={[
                styles.toastCard,
                {
                  backgroundColor: tone.backgroundColor,
                },
              ]}
            >
              <View style={[styles.toastAccent, { backgroundColor: tone.accentColor }]} />
              <View style={styles.toastBody}>
                <Text style={[styles.toastTitle, { color: tone.titleColor }]}>{toast.title}</Text>
                <Text style={[styles.toastMessage, { color: tone.messageColor }]}>{toast.message}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
};

export const useAppToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 14,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1200,
    gap: spacing.sm,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...shadow.md,
  },
  toastAccent: {
    width: 6,
    alignSelf: 'stretch',
    borderRadius: radius.pill,
  },
  toastBody: {
    flex: 1,
    gap: 4,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  toastMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
