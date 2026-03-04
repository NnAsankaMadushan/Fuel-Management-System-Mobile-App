import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, radius } = AppTheme;

const toneMap = {
  approved: {
    backgroundColor: colors.successSoft,
    color: colors.success,
  },
  verified: {
    backgroundColor: colors.successSoft,
    color: colors.success,
  },
  pending: {
    backgroundColor: colors.accentSoft,
    color: colors.accentStrong,
  },
  rejected: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
  },
  active: {
    backgroundColor: colors.tealSoft,
    color: colors.teal,
  },
};

const StatusChip = ({ label, tone = 'pending' }) => {
  const current = toneMap[tone] || toneMap.pending;
  const text = String(label || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (value) => value.toUpperCase());

  return (
    <View style={[styles.chip, { backgroundColor: current.backgroundColor }]}>
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
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});

export default StatusChip;
