import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, radius, shadow } = AppTheme;

const MetricCard = ({ label, value, note, style }) => (
  <View style={[styles.card, style]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
    {note ? <Text style={styles.note}>{note}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    gap: 6,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  note: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default MetricCard;
