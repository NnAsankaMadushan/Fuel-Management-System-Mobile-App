import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, radius, shadow } = AppTheme;

const toneMap = {
  orange: {
    soft: colors.accentSoft,
    text: colors.accentStrong,
    border: 'rgba(249, 115, 22, 0.14)',
  },
  teal: {
    soft: colors.tealSoft,
    text: colors.teal,
    border: 'rgba(251, 146, 60, 0.16)',
  },
  dark: {
    soft: 'rgba(61, 32, 17, 0.08)',
    text: colors.surfaceDark,
    border: colors.border,
  },
};

const ActionCard = ({ mark, title, description, tone = 'orange', onPress, disabled = false, style }) => {
  const currentTone = toneMap[tone] || toneMap.orange;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: currentTone.border,
          transform: [{ translateY: pressed && !disabled ? 1 : 0 }],
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.mark, { backgroundColor: currentTone.soft }]}>
          <Text style={[styles.markText, { color: currentTone.text }]}>{mark}</Text>
        </View>
        <Text style={[styles.kicker, { color: currentTone.text }]}>Open</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: currentTone.text }]}>View workspace</Text>
        <Text style={[styles.footerArrow, { color: currentTone.text }]}>{'>'}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerArrow: {
    fontSize: 18,
    fontWeight: '800',
  },
});

export default ActionCard;
