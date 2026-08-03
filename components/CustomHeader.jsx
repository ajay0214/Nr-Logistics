import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import {
  ArrowLeft,
  Menu,
  Bell,
  User,
  Search,
  Share2,
  ChevronLeft,
} from 'lucide-react-native';
import { useTheme } from './ThemeContext';

// Placeholder logo PNG — drop your real logo file at this path (or point
// this require() at wherever you keep it) and every screen using
// `showLogo` will pick it up automatically. Replace this file whenever
// you're ready; no other code needs to change.
const DEFAULT_LOGO = require('../assets/NRLogo.png');

// Placeholder header background illustration (the warehouse / boxes /
// delivery-truck artwork). Drop your real illustration file at this path
// and every screen using CustomHeader picks it up automatically — same
// pattern as DEFAULT_LOGO above. Replace this file whenever you're
// ready; no other code needs to change.
const DEFAULT_HEADER_BG = require('../assets/headerbackground.png');

// Fallback navy tone shown behind/around the illustration (matches the
// artwork's own background so there's no color mismatch at the edges
// or while the image is loading).
const HEADER_BG_FALLBACK = '#152A6E';

/**
 * CustomHeader — fully self-contained.
 * Navigation + styling live in here. Every screen only passes:
 *   - title        (string)                      shown when `showLogo` is false/omitted
 *   - showLogo     (boolean, default false)       true = show the logo image, false = show `title` text
 *   - logo         (image source, optional)       overrides the default placeholder logo when `showLogo` is true
 *                  e.g. logo={require('../assets/logo.png')}
 *   - leftIcon     ('back' | 'menu')            default 'back'
 *   - rightIcons   array of any of: 'bell' | 'user' | 'search' | 'share'
 *
 * Center content rule: pass `showLogo` (truthy) on a screen to render the
 * logo image instead of the title text. Leave it out (or pass `title`
 * only) and the header falls back to the existing `title` text — so every
 * screen that only passes `title` keeps working exactly as before.
 *
 * Where each icon navigates to is defined once below in ICON_CONFIG —
 * change it in one place and every screen updates. Colors for each icon
 * are pulled live from ThemeContext (useTheme) so the header re-themes
 * automatically when light/dark mode changes.
 */

// ---- everything about an icon lives here: which lucide icon, its colors,
// its background, whether it shows a badge dot, and where it navigates ----
// Built as a function of the current theme `colors` so every value stays
// in sync with light/dark mode.
const buildIconConfig = (navigation, colors) => ({
  back: {
    icon: ChevronLeft,
    bg: colors.NewColor,
    color: colors.text,
    action: () => navigation.goBack(),
  },
  menu: {
    icon: Menu,
    bg: colors.NewColor,
    color: colors.text,
    action: () => navigation.dispatch(DrawerActions.openDrawer()),
  },
  bell: {
    icon: Bell,
    bg: colors.NewColor,
    color: colors.text,
    badge: true,
    badgeColor: colors.DeleteIcon,
    action: () => navigation.navigate('Notifications'),
  },
  user: {
    icon: User,
    bg: colors.NewColor,
    color: colors.text,
    action: () => navigation.navigate('Profile'),
  },
  search: {
    icon: Search,
    bg: colors.NewColor,
    color: colors.text,
    action: () => navigation.navigate('SearchOrders'),
  },
  share: {
    icon: Share2,
    bg: colors.statusPickedUpBg,
    color: colors.statusPickedUpText,
    action: () => navigation.navigate('Share'),
  },
});

const CustomHeader = ({
  title, // string shown in the center — used when `showLogo` is false
  showLogo = false, // true = show the logo image instead of `title`
  logo = DEFAULT_LOGO, // optional override for the logo image source
  leftIcon = 'back', // 'back' | 'menu'
  rightIcons = [], // e.g. ['bell', 'user']  or  ['share']  or  []
  backgroundColor,
  transparentIcons = [],
  iconColor = {},
  logoLeft = false,
}) => {
  const navigation = useNavigation();
  const { colors, typography, isDark } = useTheme();

  const ICON_CONFIG = buildIconConfig(navigation, colors);

  const renderIcon = (key, side) => {
    const config = ICON_CONFIG[key];
    if (!config) return null;
    const LucideIcon = config.icon;

    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.iconBox,
          transparentIcons.includes(key)
            ? { backgroundColor: 'transparent' }
            : { backgroundColor: config.bg },
          side === 'right' && { marginLeft: 8 },
        ]}
        onPress={config.action}
        activeOpacity={0.7}
      >
        <LucideIcon
          size={side === 'left' ? 22 : 20}
          color={iconColor[key] || config.color}
          strokeWidth={2}
        />
        {config.badge ? (
          <View
            style={[
              styles.badgeDot,
              {
                backgroundColor: config.badgeColor || colors.statusPickedUpText,
                borderColor: colors.card,
              },
            ]}
          />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View
        style={[
          styles.container,

          {
            backgroundColor: backgroundColor || HEADER_BG_FALLBACK,
            shadowColor: colors.shadow,
          },
        ]}
      >
        {/* Logistics illustration background — sits behind everything else */}
        <Image
          source={DEFAULT_HEADER_BG}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* LEFT */}
        <View style={styles.sideLeft}>
          {logoLeft ? (
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          ) : leftIcon ? (
            renderIcon(leftIcon, 'left')
          ) : null}
        </View>

        <View style={styles.center}>
          {!logoLeft &&
            (showLogo ? (
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            ) : (
              <Text style={[typography.h3, styles.title]} numberOfLines={1}>
                {title}
              </Text>
            ))}
        </View>

        <View style={styles.sideRight}>
          {rightIcons.map(key => renderIcon(key, 'right'))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    //paddingHorizontal: 14,
    overflow: 'hidden',

    paddingTop: Platform.OS === 'ios' ? 0 : 0,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: -4,
    right: -4,
    bottom: 0,
    width: undefined,
    height: undefined,
  },
  sideLeft: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 15,
  },
  sideRight: {
    width: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 15,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  logo: {
    width: 120,
    height: 32,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});

export default CustomHeader;

/* =========================================================================
   USAGE — every screen only passes title + icon names, nothing else.
   Set `showLogo` (true) on the one/two screens where you want the logo
   image instead of text — everything else keeps using `title` text
   exactly as before. The logo image itself defaults to DEFAULT_LOGO
   above; pass a `logo` prop only if a specific screen needs a different
   image than the default placeholder.

   The header background illustration (warehouse / boxes / truck) is
   drawn from DEFAULT_HEADER_BG above on every screen automatically —
   drop your real artwork file at '../assets/HeaderBackground.png' and
   it appears everywhere CustomHeader is used, no per-screen changes
   needed.
   ========================================================================= */

/*
import CustomHeader from '../components/CustomHeader';

// Dashboard — hamburger menu + bell + profile (title text)
<CustomHeader title="Dashboard" leftIcon="menu" rightIcons={['bell', 'user']} />

// Home / landing screen — logo image instead of text title
<CustomHeader
  showLogo
  leftIcon="menu"
  rightIcons={['bell', 'user']}
/>

// Same idea, but overriding which image is used on this one screen
<CustomHeader
  showLogo
  logo={require('../assets/logo-alt.png')}
  leftIcon="menu"
  rightIcons={['bell', 'user']}
/>

// My Orders — hamburger menu + search + bell
<CustomHeader title="My Orders" leftIcon="menu" rightIcons={['search', 'bell']} />

// My Deliveries — hamburger menu + bell
<CustomHeader title="My Deliveries" leftIcon="menu" rightIcons={['bell']} />

// Pickup — hamburger menu + bell + profile
<CustomHeader title="Pickup" leftIcon="menu" rightIcons={['bell', 'user']} />

// Pickup details — back arrow + bell + profile (matches your reference image)
<CustomHeader title="Pickup details" leftIcon="back" rightIcons={['bell', 'user']} />

// Settings — back arrow only, no right icons
<CustomHeader title="Settings" leftIcon="back" rightIcons={[]} />

// Order tracking — back arrow + share
<CustomHeader title="Order #ORD12345" leftIcon="back" rightIcons={['share']} />
*/
