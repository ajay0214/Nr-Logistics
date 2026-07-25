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
} from 'lucide-react-native';
import { useTheme, Fonts } from '../components/ThemeContext';

/* ------------------------------------------------------------------ */
/* Tab configuration                                                    */
/* `key` must match the activeTab values used by the parent screen.    */
/* ------------------------------------------------------------------ */
const TABS = [
  { key: 'Dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { key: 'Orders', label: 'Orders', Icon: ShoppingBag },

  { key: 'Pickup', label: 'Pickup', Icon: Package },
  { key: 'Delivery', label: 'Delivery', Icon: Truck },
];

const ICON_SIZE = 20;
const BUBBLE_SIZE = 48;
const BAR_HEIGHT = 90;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = SCREEN_WIDTH / TABS.length;

/** Formats the cart count for the badge — anything over 99 becomes "99+". */
const formatBadgeCount = count => (count > 99 ? '99+' : String(count));

/**
 * CustomBottomTab
 *
 * Custom bottom navigation bar themed to match the dashboard screen —
 * white bar, green accent, and a floating bubble that slides and pops
 * behind whichever tab is active. Pure React Native + Animated API,
 * no SVG, no Reanimated, no third-party UI libraries.
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

  // Drives the bubble's horizontal position — a single Animated.Value
  // moving between 0 and TABS.length - 1.
  const position = useRef(new Animated.Value(activeIndex)).current;

  // Drives the little "pop" scale of the bubble + active icon whenever
  // the active tab changes.
  const bubbleScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(position, {
      toValue: activeIndex,
      useNativeDriver: true,
      friction: 7,
      tension: 70,
    }).start();

    // Quick pop: shrink then spring back up past 1 for a bubbly feel.
    bubbleScale.setValue(0.7);
    Animated.spring(bubbleScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 120,
    }).start();
  }, [activeIndex, position, bubbleScale]);

  // Horizontal position of the bubble, centered under each tab.
  const bubbleTranslateX = position.interpolate({
    inputRange: TABS.map((_, i) => i),
    outputRange: TABS.map(
      (_, i) => i * TAB_WIDTH + TAB_WIDTH / 2 - BUBBLE_SIZE / 2,
    ),
  });

  const ActiveIcon = TABS[activeIndex].Icon;

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
      {/* Animated floating bubble — sits behind the active tab and
          slides across as activeTab changes. */}
      <Animated.View
        style={[
          styles.bubble,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.DarkGreenColor,
            transform: [
              { translateX: bubbleTranslateX },
              { scale: bubbleScale },
            ],
          },
        ]}
      >
        <ActiveIcon
          size={ICON_SIZE + 2}
          color={colors.NavbarTextColour}
          strokeWidth={2.2}
        />

        {/* Cart badge on the bubble when Orders is the active tab */}
        {activeTab === 'Orders' && cartCount > 0 && (
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
      </Animated.View>

      {/* Static row of tab buttons */}
      <View style={styles.tabRow}>
        {TABS.map(tab => {
          const isActive = tab.key === activeTab;
          const { Icon } = tab;

          // Badge on the static icon only when Orders is NOT active
          // (the active version already shows its own badge on the bubble).
          const showStaticBadge =
            tab.key === 'Orders' && cartCount > 0 && !isActive;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => onTabPress(tab.key)}
            >
              {/* Reserve the same vertical space whether or not the icon
                  is visible here, so the label doesn't jump when the
                  bubble covers the active icon. */}
              <View style={styles.iconSlot}>
                {!isActive && (
                  <Icon
                    size={ICON_SIZE}
                    color={colors.bottomTabInactiveText}
                    strokeWidth={2}
                  />
                )}

                {showStaticBadge && (
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
                    ? [
                        styles.labelActive,
                        { color: colors.bottomTabActiveText },
                      ]
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
  },
  iconSlot: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE - 12,
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
  bubble: {
    position: 'absolute',
    top: -20, // floats above the bar, "bubble" effect
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
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
