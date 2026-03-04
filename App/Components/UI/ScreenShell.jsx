import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTheme } from '../../../constants/Colors';

const { colors, spacing, radius } = AppTheme;

const ScreenShell = ({
  badge,
  title,
  subtitle,
  children,
  scroll = true,
  heroAside,
  headerIcon,
  headerAction,
  contentContainerStyle,
}) => {
  const Container = scroll ? ScrollView : View;
  const containerProps = scroll
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: [styles.scrollContent, contentContainerStyle],
      }
    : {
        style: [styles.fill, styles.fixedContent, contentContainerStyle],
      };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <View style={styles.background}>
        <View style={styles.topGlow} />
        <Container {...containerProps}>
          {(badge || title || subtitle || heroAside || headerAction) ? (
            <View style={styles.header}>
              {headerIcon ? (
                <View style={styles.logoShell}>
                  <Image source={headerIcon} style={styles.logoImage} resizeMode="contain" />
                </View>
              ) : null}
              {(badge || title || subtitle || headerAction) ? (
                <View style={styles.headerRow}>
                  <View style={styles.headerCopy}>
                    {badge ? <Text style={styles.badge}>{badge}</Text> : null}
                    {title ? <Text style={styles.title}>{title}</Text> : null}
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                  </View>
                  {headerAction ? <View style={styles.headerAction}>{headerAction}</View> : null}
                </View>
              ) : null}
              {heroAside ? <View style={styles.heroAside}>{heroAside}</View> : null}
            </View>
          ) : null}

          <View style={[styles.body, !scroll && styles.bodyFill]}>{children}</View>
        </Container>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  fill: {
    flex: 1,
  },
  fixedContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  background: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  body: {
    gap: spacing.md,
  },
  bodyFill: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  logoShell: {
    width: 96,
    height: 96,
    borderRadius: 28,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  headerAction: {
    paddingTop: 4,
  },
  heroAside: {
    marginTop: spacing.sm,
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
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  topGlow: {
    position: 'absolute',
    top: 8,
    right: -36,
    width: 132,
    height: 132,
    borderRadius: 999,
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
  },
});

export default ScreenShell;
