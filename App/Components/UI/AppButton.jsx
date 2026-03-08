import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, radius, shadow } = AppTheme;

const variants = {
  primary: {
    backgroundColor: colors.accent,
    borderColor: 'rgba(194, 65, 12, 0.18)',
    textColor: colors.white,
    shadowColor: colors.accentStrong,
  },
  secondary: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    textColor: colors.text,
    shadowColor: shadow.sm.shadowColor,
  },
  ghost: {
    backgroundColor: colors.accentSoft,
    borderColor: 'rgba(249, 115, 22, 0.16)',
    textColor: colors.accentStrong,
    shadowColor: shadow.sm.shadowColor,
  },
  logout: {
    backgroundColor: colors.surfaceDark,
    borderColor: 'rgba(255, 239, 229, 0.12)',
    textColor: colors.white,
    shadowColor: colors.surfaceDark,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(209, 74, 49, 0.18)',
    textColor: colors.danger,
    shadowColor: shadow.sm.shadowColor,
  },
};

const AppButton = ({ title, onPress, variant = 'primary', disabled = false, loading = false, style }) => {
  const current = variants[variant] || variants.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: current.backgroundColor,
          borderColor: current.borderColor,
          opacity: disabled || loading ? 0.7 : 1,
          shadowColor: current.shadowColor,
          transform: [{ translateY: pressed ? 1 : 0 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={current.textColor} />
      ) : (
        <Text style={[styles.label, { color: current.textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.25,
  },
});

export default AppButton;
