import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, radius } = AppTheme;

const toneMap = {
  approved: {
    backgroundColor: colors.successSoft,
    color: colors.success,
    borderColor: 'rgba(249, 115, 22, 0.16)',
  },
  verified: {
    backgroundColor: colors.successSoft,
    color: colors.success,
    borderColor: 'rgba(249, 115, 22, 0.16)',
  },
  completed: {
    backgroundColor: colors.successSoft,
    color: colors.success,
    borderColor: 'rgba(249, 115, 22, 0.16)',
  },
  pending: {
    backgroundColor: colors.amberSoft,
    color: '#a05f12',
    borderColor: 'rgba(245, 158, 11, 0.16)',
  },
  rejected: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
    borderColor: 'rgba(209, 74, 49, 0.16)',
  },
  active: {
    backgroundColor: colors.tealSoft,
    color: colors.teal,
    borderColor: 'rgba(251, 146, 60, 0.16)',
  },
};

const StatusChip = ({ label, tone = 'pending' }) => {
  const current = toneMap[tone] || toneMap.pending;
  const text = String(label || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (value) => value.toUpperCase());

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: current.backgroundColor,
          borderColor: current.borderColor,
        },
      ]}
    >
      <Text style={[styles.label, { color: current.color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

export default StatusChip;
