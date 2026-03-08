import React, { useContext } from 'react';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTheme } from '../../../constants/Colors';
import { useUser } from '../../../context/UserContext';
import { getUserRoleLabel } from '../../../utils/userRole';

const { colors, spacing, radius, shadow } = AppTheme;

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
  showUserIdentity = false,
  showBackButton = true,
}) => {
  const navigation = useNavigation();
  const { user } = useUser();
  const { width } = useWindowDimensions();
  const tabBarHeight = useContext(BottomTabBarHeightContext) || 0;
  const isCompactScreen = width < 390;
  const Container = scroll ? ScrollView : View;
  const bottomPadding = Math.max(spacing.xl, tabBarHeight + spacing.lg);
  const canGoBack = typeof navigation?.canGoBack === 'function' ? navigation.canGoBack() : false;
  const shouldShowBackButton = showBackButton && canGoBack && !tabBarHeight;
  const containerProps = scroll
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: [
          styles.scrollContent,
          { paddingBottom: bottomPadding },
          contentContainerStyle,
        ],
      }
    : {
        style: [styles.fill, styles.fixedContent, { paddingBottom: bottomPadding }, contentContainerStyle],
      };

  const userName = String(user?.name || '').trim() || 'User';
  const roleLabel = getUserRoleLabel(user?.role);
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase() || '')
    .join('') || 'U';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <View style={styles.background}>
        <View style={styles.topGlowPrimary} />
        <View style={styles.topGlowSecondary} />
        <Container {...containerProps}>
          {(badge || title || subtitle || heroAside || headerAction) ? (
            <View style={[styles.headerPanel, isCompactScreen ? styles.headerPanelCompact : null]}>
              <View style={styles.headerOrbPrimary} />
              <View style={styles.headerOrbSecondary} />
              {showUserIdentity ? (
                <View style={[styles.identityCard, isCompactScreen ? styles.identityCardCompact : null]}>
                  <View style={[styles.identityAvatar, isCompactScreen ? styles.identityAvatarCompact : null]}>
                    <Text
                      style={[
                        styles.identityAvatarText,
                        isCompactScreen ? styles.identityAvatarTextCompact : null,
                      ]}
                    >
                      {userInitials}
                    </Text>
                  </View>
                  <View style={styles.identityCopy}>
                    <Text style={styles.identityKicker} numberOfLines={1}>
                      Signed in as
                    </Text>
                    <Text
                      style={[styles.identityName, isCompactScreen ? styles.identityNameCompact : null]}
                      numberOfLines={1}
                    >
                      {userName}
                    </Text>
                    <Text style={styles.identityRole} numberOfLines={1}>
                      {roleLabel}
                    </Text>
                  </View>
                </View>
              ) : null}
              {(badge || title || subtitle || headerAction || headerIcon || shouldShowBackButton) ? (
                <View style={[styles.headerRow, isCompactScreen ? styles.headerRowCompact : null]}>
                  <View style={styles.headerCopy}>
                    {badge ? <Text style={styles.badge}>{badge}</Text> : null}
                    {title ? <Text style={[styles.title, isCompactScreen ? styles.titleCompact : null]}>{title}</Text> : null}
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                  </View>
                  {(headerIcon || headerAction || shouldShowBackButton) ? (
                    <View style={[styles.headerAside, isCompactScreen ? styles.headerAsideCompact : null]}>
                      {(shouldShowBackButton || headerAction) ? (
                        <View style={[styles.headerActionRow, isCompactScreen ? styles.headerActionRowCompact : null]}>
                          {shouldShowBackButton ? (
                            <Pressable
                              onPress={() => navigation.goBack()}
                              style={({ pressed }) => [
                                styles.headerButton,
                                pressed ? styles.headerButtonPressed : null,
                              ]}
                            >
                              <Text style={styles.headerButtonText}>Back</Text>
                            </Pressable>
                          ) : null}
                          {headerAction ? <View style={styles.headerAction}>{headerAction}</View> : null}
                        </View>
                      ) : null}
                      {headerIcon ? (
                        <View style={[styles.logoShell, isCompactScreen ? styles.logoShellCompact : null]}>
                          <Image source={headerIcon} style={styles.logoImage} resizeMode="contain" />
                        </View>
                      ) : null}
                    </View>
                  ) : null}
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
  },
  background: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  body: {
    gap: spacing.lg,
  },
  bodyFill: {
    flex: 1,
  },
  headerPanel: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: spacing.md,
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.md,
  },
  headerPanelCompact: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerRowCompact: {
    flexWrap: 'wrap',
  },
  headerCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  headerAside: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  headerAsideCompact: {
    width: '100%',
    alignItems: 'flex-start',
  },
  logoShell: {
    width: 88,
    height: 88,
    borderRadius: 28,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 248, 242, 0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  logoShellCompact: {
    width: 72,
    height: 72,
    borderRadius: 24,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  headerActionRowCompact: {
    justifyContent: 'flex-start',
  },
  headerAction: {
    maxWidth: '100%',
  },
  heroAside: {
    marginTop: spacing.xs,
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
    fontFamily: 'Georgia',
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 37,
  },
  titleCompact: {
    fontSize: 27,
    lineHeight: 33,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  topGlowPrimary: {
    position: 'absolute',
    top: -28,
    left: -18,
    width: 184,
    height: 184,
    borderRadius: 999,
    backgroundColor: 'rgba(249, 115, 22, 0.10)',
  },
  topGlowSecondary: {
    position: 'absolute',
    top: 92,
    right: -44,
    width: 176,
    height: 176,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 158, 11, 0.10)',
  },
  headerOrbPrimary: {
    position: 'absolute',
    top: -36,
    right: -24,
    width: 148,
    height: 148,
    borderRadius: 999,
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
  },
  headerOrbSecondary: {
    position: 'absolute',
    bottom: -52,
    left: -28,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(251, 146, 60, 0.08)',
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadow.sm,
  },
  identityCardCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  identityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.16)',
  },
  identityAvatarCompact: {
    width: 40,
    height: 40,
  },
  identityAvatarText: {
    color: colors.accentStrong,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  identityAvatarTextCompact: {
    fontSize: 14,
  },
  identityCopy: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: 2,
  },
  identityKicker: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  identityName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  identityNameCompact: {
    fontSize: 15,
    lineHeight: 19,
  },
  identityRole: {
    color: colors.accentStrong,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  headerButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.16)',
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  headerButtonText: {
    color: colors.accentStrong,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

export default ScreenShell;
