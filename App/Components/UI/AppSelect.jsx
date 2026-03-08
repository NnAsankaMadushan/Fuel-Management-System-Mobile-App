import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, shadow } = AppTheme;

const AppSelect = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
}) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.selectShell}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.select}
          dropdownIconColor={colors.textMuted}
        >
          <Picker.Item label={placeholder} value="" color={colors.textMuted} enabled={false} />
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} color={colors.text} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  selectShell: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    overflow: 'hidden',
    ...shadow.sm,
  },
  select: {
    color: colors.text,
    minHeight: 56,
  },
});

export default AppSelect;
