import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, shadow } = AppTheme;

const AppInput = ({
  label,
  style,
  containerStyle,
  onBlur,
  onFocus,
  multiline = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={[styles.label, isFocused ? styles.labelFocused : null]}>{label}</Text> : null}
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          !multiline ? styles.singleLineInput : null,
          multiline ? styles.multilineInput : null,
          isFocused ? styles.inputFocused : null,
          style,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
    width: '100%',
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelFocused: {
    color: colors.accentStrong,
  },
  input: {
    width: '100%',
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'android' ? 13 : 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    ...shadow.sm,
  },
  singleLineInput: {
    textAlignVertical: 'center',
  },
  inputFocused: {
    borderColor: 'rgba(249, 115, 22, 0.38)',
    shadowColor: colors.accentStrong,
    shadowOpacity: 0.14,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    textAlignVertical: 'top',
  },
});

export default AppInput;
