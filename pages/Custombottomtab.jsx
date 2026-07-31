import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Package,
  User,
  UserRound,
  CircleUser,
  UserCircle,
} from 'lucide-react-native';
import { useTheme, Fonts } from '../components/ThemeContext';

/* ------------------------------------------------------------------ */
/* Tab configuration                                                    */
/* `key` must match the activeTab values used by the parent screen.    */
/* ------------------------------------------------------------------ */
const TABS = [
  { key: 'Dashboard', label: 'Overview', Icon: LayoutDashboard },
  { key: 'Orders', label: 'Orders', Icon: ShoppingBag },

  { key: 'Delivery', label: 'Delivery', Icon: Truck },
  { key: 'Profile', label: 'Profile', Icon: UserRound },
];

const ICON_SIZE = 20;
const BUBBLE_SIZE = 48;
const BAR_HEIGHT = 90;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = SCREEN_WIDTH / TABS.length;

// Horizontal inset of the sliding pill within each tab's slot.
const PILL_H_PADDING = 10;
const PILL_WIDTH = TAB_WIDTH - PILL_H_PADDING * 2;
const PILL_HEIGHT = 58;

/** Formats the cart count for the badge — anything over 99 becomes "99+". */
const formatBadgeCount = count => (count > 99 ? '99+' : String(count));

/**
 * CustomBottomTab
 *
 * Custom bottom navigation bar themed to match the dashboard screen —
 * dark navy bar with a sliding rounded-rect pill that highlights
 * whichever tab is active (icon + label together inside the pill).
 * Pure React Native + Animated API, no SVG, no Reanimated, no
 * third-party UI libraries.
 *
 * Colors and typography are pulled live from ThemeContext (useTheme),
 * so the bar automatically re-themes when light/dark mode changes.
 *
 * Props:
 * - activeTab  : string  -> currently selected tab key
 * - onTabPress : (key: string) => void -> called when a tab is tapped
 * - cartCount  : number  -> badge count shown on the Orders icon
 */
const CustomBottomTab = ({ activeTab, onTabPress, cartCount = 0 }) => {
  const { colors, typography } = useTheme();

  const activeIndex = useMemo(() => {
    const idx = TABS.findIndex(t => t.key === activeTab);
    return idx === -1 ? 0 : idx;
  }, [activeTab]);

  // Drives the pill's horizontal position — a single Animated.Value
  // moving between 0 and TABS.length - 1.
  const position = useRef(new Animated.Value(activeIndex)).current;

  // Drives the little "pop" scale of the pill whenever the active tab
  // changes.
  const pillScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(position, {
      toValue: activeIndex,
      useNativeDriver: true,
      friction: 8,
      tension: 70,
    }).start();

    // Quick pop: shrink then spring back up past 1 for a bubbly feel.
    pillScale.setValue(0.85);
    Animated.spring(pillScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 120,
    }).start();
  }, [activeIndex, position, pillScale]);

  // Horizontal position of the pill, centered under each tab.
  const pillTranslateX = position.interpolate({
    inputRange: TABS.map((_, i) => i),
    outputRange: TABS.map((_, i) => i * TAB_WIDTH + PILL_H_PADDING),
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bottomTabBg,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {/* Animated pill — slides behind whichever tab is active,
          wrapping its icon + label together. */}
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.DarkGreenColor,
            transform: [{ translateX: pillTranslateX }, { scale: pillScale }],
          },
        ]}
      />

      {/* Static row of tab buttons, rendered above the pill */}
      <View style={styles.tabRow}>
        {TABS.map(tab => {
          const isActive = tab.key === activeTab;
          const { Icon } = tab;

          const showBadge = tab.key === 'Orders' && cartCount > 0;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => onTabPress(tab.key)}
            >
              <View style={styles.iconSlot}>
                <Icon
                  size={ICON_SIZE}
                  color={
                    isActive
                      ? colors.NavbarTextColour
                      : colors.bottomTabInactiveText
                  }
                  strokeWidth={2}
                />

                {showBadge && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: colors.statusPickedUpText,
                        borderColor: colors.bottomTabBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.small,
                        styles.badgeText,
                        { color: colors.NavbarTextColour },
                      ]}
                    >
                      {formatBadgeCount(cartCount)}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  typography.small,
                  styles.label,
                  isActive
                    ? [styles.labelActive, { color: colors.NavbarTextColour }]
                    : [
                        styles.labelInactive,
                        { color: colors.bottomTabInactiveText },
                      ],
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: BAR_HEIGHT,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // iOS shadow
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Android shadow
    elevation: 12,
  },
  tabRow: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
    paddingTop: 14,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 2,
  },
  iconSlot: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE - 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
  },
  labelActive: {
    fontWeight: '700',
  },
  labelInactive: {
    fontWeight: '500',
  },
  pill: {
    position: 'absolute',
    top: 12,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
});

export default CustomBottomTab;
