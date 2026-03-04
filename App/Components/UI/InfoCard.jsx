import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, radius, shadow } = AppTheme;

const tones = {
  orange: {
    accent: colors.accent,
    soft: colors.accentSoft,
  },
  teal: {
    accent: colors.teal,
    soft: colors.tealSoft,
  },
  dark: {
    accent: colors.text,
    soft: colors.surfaceMuted,
  },
};

const InfoCard = ({ eyebrow, title, description, value, tone = 'orange', onPress }) => {
  const current = tones[tone] || tones.orange;
  const Wrapper = onPress ? Pressable : View;
  const wrapperStyle = onPress
    ? ({ pressed }) => [
        styles.card,
        { transform: [{ translateY: pressed ? 1 : 0 }] },
      ]
    : styles.card;

  return (
    <Wrapper onPress={onPress} style={wrapperStyle}>
      <View style={[styles.accentBubble, { backgroundColor: current.soft }]}>
        <Text style={[styles.accentText, { color: current.accent }]}>{value || '  '}</Text>
      </View>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  accentBubble: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentText: {
    fontSize: 15,
    fontWeight: '800',
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
});

export default InfoCard;
