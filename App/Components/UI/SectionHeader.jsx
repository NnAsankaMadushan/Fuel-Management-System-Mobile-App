import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, radius } = AppTheme;

const SectionHeader = ({ badge, title, subtitle, trailing }) => (
  <View style={styles.header}>
    <View style={styles.copy}>
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  copy: {
    gap: 4,
  },
  trailing: {
    alignSelf: 'flex-start',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    color: colors.accentStrong,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});

export default SectionHeader;
