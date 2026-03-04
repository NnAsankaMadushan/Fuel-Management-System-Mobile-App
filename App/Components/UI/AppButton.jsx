import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, radius, shadow } = AppTheme;

const variants = {
  primary: {
    backgroundColor: colors.accent,
    borderColor: 'transparent',
    textColor: colors.white,
  },
  secondary: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    textColor: colors.text,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.borderStrong,
    textColor: colors.text,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(220, 76, 63, 0.16)',
    textColor: colors.danger,
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
          transform: [{ translateY: pressed ? -1 : 0 }],
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
    minHeight: 54,
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
  },
});

export default AppButton;
