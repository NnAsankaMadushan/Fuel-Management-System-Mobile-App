import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing } = AppTheme;

const AppInput = ({ label, style, ...props }) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    minHeight: 56,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 33, 47, 0.12)',
    backgroundColor: colors.surfaceStrong,
    color: colors.text,
    fontSize: 15,
  },
});

export default AppInput;
