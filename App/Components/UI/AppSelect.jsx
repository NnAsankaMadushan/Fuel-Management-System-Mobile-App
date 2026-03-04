import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing } = AppTheme;

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
    fontSize: 15,
    fontWeight: '700',
  },
  selectShell: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 33, 47, 0.12)',
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
  },
  select: {
    color: colors.text,
    minHeight: 56,
  },
});

export default AppSelect;
