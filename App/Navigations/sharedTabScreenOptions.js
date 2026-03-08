import { Platform } from 'react-native';
import { AppTheme } from '../../constants/Colors';

const { radius, shadow } = AppTheme;

export const tabScreenOptions = {
  headerShown: false,
  tabBarHideOnKeyboard: true,
  sceneContainerStyle: {
    backgroundColor: AppTheme.colors.canvas,
  },
  tabBarActiveTintColor: AppTheme.tabBar.activeTintColor,
  tabBarInactiveTintColor: AppTheme.tabBar.inactiveTintColor,
  tabBarStyle: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 18 : 14,
    height: Platform.OS === 'ios' ? 84 : 76,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: AppTheme.tabBar.borderTopColor,
    borderRadius: radius.xl,
    backgroundColor: AppTheme.tabBar.backgroundColor,
    ...shadow.lg,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.35,
  },
  tabBarItemStyle: {
    borderRadius: radius.lg,
  },
};
