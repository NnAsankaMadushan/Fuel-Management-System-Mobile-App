import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, radius, shadow } = AppTheme;

const toneMap = {
  surface: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    labelColor: colors.textMuted,
    valueColor: colors.text,
    noteColor: colors.textMuted,
  },
  accent: {
    backgroundColor: colors.accent,
    borderColor: 'rgba(194, 65, 12, 0.18)',
    labelColor: 'rgba(255, 248, 242, 0.78)',
    valueColor: colors.white,
    noteColor: 'rgba(255, 248, 242, 0.88)',
  },
  amber: {
    backgroundColor: colors.teal,
    borderColor: 'rgba(251, 146, 60, 0.18)',
    labelColor: 'rgba(255, 247, 240, 0.74)',
    valueColor: colors.white,
    noteColor: 'rgba(255, 247, 240, 0.86)',
  },
  dark: {
    backgroundColor: colors.surfaceDark,
    borderColor: 'rgba(255, 239, 229, 0.10)',
    labelColor: 'rgba(255, 239, 229, 0.64)',
    valueColor: colors.textOnDark,
    noteColor: 'rgba(255, 239, 229, 0.82)',
  },
};

const MetricCard = ({ label, value, note, style, tone = 'surface' }) => {
  const currentTone = toneMap[tone] || toneMap.surface;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: currentTone.backgroundColor,
          borderColor: currentTone.borderColor,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: currentTone.labelColor }]}>{label}</Text>
      <Text style={[styles.value, { color: currentTone.valueColor }]}>{value}</Text>
      {note ? <Text style={[styles.note, { color: currentTone.noteColor }]}>{note}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    gap: 6,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    ...shadow.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: 'Georgia',
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 35,
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
  },
});

export default MetricCard;
