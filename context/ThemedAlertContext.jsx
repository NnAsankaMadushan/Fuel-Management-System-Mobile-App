import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../constants/Colors';
import { setThemedAlertPresenter, showThemedAlert } from '../utils/themedAlertBridge';

const { colors, spacing, radius, shadow } = AppTheme;
const TOAST_TOP_OFFSET = (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + spacing.sm;
const SNACKBAR_ENTER_MS = 180;
const SNACKBAR_EXIT_MS = 140;
const SNACKBAR_BASE_DURATION_MS = 3200;
const SNACKBAR_ERROR_DURATION_MS = 4200;
const SNACKBAR_ACTION_DURATION_MS = 5200;

const AlertContext = createContext({
  showAlert: showThemedAlert,
});

const normalizeButtons = (buttons) => {
  if (!Array.isArray(buttons) || buttons.length === 0) {
    return [{ text: 'OK' }];
  }

  return buttons.map((button) => ({
    text: String(button?.text || 'OK'),
    style: button?.style || 'default',
    onPress: typeof button?.onPress === 'function' ? button.onPress : undefined,
  }));
};

const normalizeOptions = (options) => ({
  cancelable: options?.cancelable !== false,
  onDismiss: typeof options?.onDismiss === 'function' ? options.onDismiss : undefined,
});

const normalizeAlertText = (title, message) => {
  const normalizedTitle = String(title || '').trim();
  const normalizedMessage = String(message || '').trim();

  if (!normalizedTitle && !normalizedMessage) {
    return {
      title: '',
      message: 'Notice',
    };
  }

  if (!normalizedMessage) {
    return {
      title: '',
      message: normalizedTitle,
    };
  }

  return {
    title: normalizedTitle,
    message: normalizedMessage,
  };
};

const inferVariant = (title, message) => {
  const value = `${title} ${message}`.toLowerCase();

  if (/(error|failed|missing|mismatch|invalid|required|unable|denied|not found|could not)/.test(value)) {
    return 'error';
  }

  if (/(success|verified|registered|updated|created|added|removed|deleted|saved|recorded|requested)/.test(value)) {
    return 'success';
  }

  return 'info';
};

const pickActionButton = (buttons) => {
  if (!Array.isArray(buttons) || buttons.length === 0) {
    return null;
  }

  const nonCancelAction = buttons.find((button) => button?.style !== 'cancel' && typeof button?.onPress === 'function');
  if (nonCancelAction) {
    return nonCancelAction;
  }

  return buttons.find((button) => typeof button?.onPress === 'function') || null;
};

const getDisplayDuration = (variant, actionButton) => {
  if (actionButton) {
    return SNACKBAR_ACTION_DURATION_MS;
  }

  if (variant === 'error') {
    return SNACKBAR_ERROR_DURATION_MS;
  }

  return SNACKBAR_BASE_DURATION_MS;
};

const getVariantMeta = (variant) => {
  switch (variant) {
    case 'error':
      return {
        label: 'Error',
        backgroundColor: '#fff8f7',
        borderColor: 'rgba(220, 76, 63, 0.18)',
        accentColor: colors.danger,
        labelColor: colors.danger,
        messageColor: colors.text,
      };
    case 'success':
      return {
        label: 'Success',
        backgroundColor: '#f6fcf9',
        borderColor: 'rgba(29, 139, 95, 0.18)',
        accentColor: colors.success,
        labelColor: colors.success,
        messageColor: colors.text,
      };
    default:
      return {
        label: 'Notice',
        backgroundColor: '#fffaf4',
        borderColor: 'rgba(221, 91, 17, 0.18)',
        accentColor: colors.accentStrong,
        labelColor: colors.accentStrong,
        messageColor: colors.text,
      };
  }
};

const ThemedAlertProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const activeAlert = queue.length > 0 ? queue[0] : null;
  const autoHideTimerRef = useRef(null);
  const isClosingRef = useRef(false);
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const clearAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) {
      globalThis.clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setThemedAlertPresenter((incomingAlert) => {
      const normalizedButtons = normalizeButtons(incomingAlert?.buttons);
      const normalizedText = normalizeAlertText(incomingAlert?.title, incomingAlert?.message);
      const actionButton = pickActionButton(normalizedButtons);
      const variant = inferVariant(normalizedText.title, normalizedText.message);

      setQueue((currentQueue) => [
        ...currentQueue,
        {
          title: normalizedText.title,
          message: normalizedText.message,
          buttons: normalizedButtons,
          actionButton,
          variant,
          durationMs: getDisplayDuration(variant, actionButton),
          options: normalizeOptions(incomingAlert?.options),
        },
      ]);
    });

    return () => {
      setThemedAlertPresenter(null);
    };
  }, []);

  const closeAlert = useCallback(
    (reason = 'dismiss') => {
      if (!activeAlert || isClosingRef.current) {
        return;
      }

      isClosingRef.current = true;
      clearAutoHideTimer();

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: SNACKBAR_EXIT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -24,
          duration: SNACKBAR_EXIT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setQueue((currentQueue) => currentQueue.slice(1));
        isClosingRef.current = false;

        if (reason === 'action') {
          activeAlert?.actionButton?.onPress?.();
          return;
        }

        activeAlert?.options?.onDismiss?.();
      });
    },
    [activeAlert, clearAutoHideTimer, opacity, translateY],
  );

  useEffect(() => {
    clearAutoHideTimer();

    if (!activeAlert) {
      return undefined;
    }

    isClosingRef.current = false;
    translateY.setValue(-24);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: SNACKBAR_ENTER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: SNACKBAR_ENTER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    autoHideTimerRef.current = globalThis.setTimeout(() => {
      closeAlert('dismiss');
    }, activeAlert.durationMs);

    return () => {
      clearAutoHideTimer();
    };
  }, [activeAlert, clearAutoHideTimer, closeAlert, opacity, translateY]);

  useEffect(
    () => () => {
      clearAutoHideTimer();
    },
    [clearAutoHideTimer],
  );

  const contextValue = useMemo(
    () => ({
      showAlert: showThemedAlert,
    }),
    [],
  );

  return (
    <AlertContext.Provider value={contextValue}>
      <View style={styles.root}>
        {children}

        {activeAlert ? (
          <View pointerEvents="box-none" style={styles.portalContainer}>
            <Animated.View
              style={[
                styles.snackbarWrap,
                {
                  opacity,
                  transform: [{ translateY }],
                },
              ]}
            >
              {(() => {
                const variantMeta = getVariantMeta(activeAlert.variant);
                const labelText = activeAlert.title || variantMeta.label;

                return (
                  <View
                    style={[
                      styles.snackbarCard,
                      {
                        backgroundColor: variantMeta.backgroundColor,
                        borderColor: variantMeta.borderColor,
                      },
                    ]}
                  >
                    <View
                      pointerEvents="none"
                      style={[styles.accentRail, { backgroundColor: variantMeta.accentColor }]}
                    />

                    <View style={styles.contentRow}>
                      <View style={styles.messageColumn}>
                        <Text
                          style={[styles.toastLabel, { color: variantMeta.labelColor }]}
                          numberOfLines={1}
                        >
                          {labelText}
                        </Text>
                        <Text style={[styles.messageText, { color: variantMeta.messageColor }]}>
                          {activeAlert.message}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })()}
            </Animated.View>
          </View>
        ) : null}
      </View>
    </AlertContext.Provider>
  );
};

const useThemedAlert = () => useContext(AlertContext);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  portalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: TOAST_TOP_OFFSET,
    zIndex: 9999,
    elevation: 9999,
  },
  snackbarWrap: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  snackbarCard: {
    minHeight: 64,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingVertical: 14,
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.md,
  },
  accentRail: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 4,
    borderRadius: radius.pill,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.xs,
  },
  messageColumn: {
    flex: 1,
    gap: 2,
  },
  toastLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
});

export { ThemedAlertProvider, useThemedAlert };
