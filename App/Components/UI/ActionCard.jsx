import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, radius, shadow } = AppTheme;

const toneMap = {
  orange: {
    soft: colors.accentSoft,
    text: colors.accentStrong,
  },
  teal: {
    soft: colors.tealSoft,
    text: colors.teal,
  },
  dark: {
    soft: 'rgba(24, 33, 47, 0.08)',
    text: colors.text,
  },
};

const ActionCard = ({ mark, title, description, tone = 'orange', onPress, style }) => {
  const currentTone = toneMap[tone] || toneMap.orange;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          transform: [{ translateY: pressed ? -1 : 0 }],
        },
        style,
      ]}
    >
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.mark, { backgroundColor: currentTone.soft }]}>
          <Text style={[styles.markText, { color: currentTone.text }]}>{mark}</Text>
        </View>
      </View>
      {description ? <Text style={styles.description}>{description}</Text> : null}
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
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  mark: {
    width: 48,
    height: 48,
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
});

export default ActionCard;
