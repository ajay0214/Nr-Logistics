import React from 'react';
import {
  View,
  Text,
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

/**
 * CustomHeader — fully self-contained.
 * Navigation + styling live in here. Every screen only passes:
 *   - title        (string)
 *   - leftIcon     ('back' | 'menu')            default 'back'
 *   - rightIcons   array of any of: 'bell' | 'user' | 'search' | 'share'
 *
 * Where each icon navigates to, its colors, and its badge are all defined
 * once below in ICON_CONFIG — change it in one place and every screen updates.
 */

// ---- everything about an icon lives here: which lucide icon, its colors,
// its background, whether it shows a badge dot, and where it navigates ----
// Colors matched to the dashboard: brand green primary, soft neutral
// backgrounds, amber for pending/attention state, blue reserved for
// informational (in-transit) status only.
// const ICON_CONFIG = {
//   back: {
//     icon: ChevronLeft,
//     bg: '#bdc3c733',
//     color: '#2c3e50',
//     action: navigation => navigation.goBack(),
//   },
//   menu: {
//     icon: Menu,
//     bg: '#F1F3F1',
//     color: '#1E2A22',
//     action: navigation => navigation.dispatch(DrawerActions.openDrawer()),
//   },
//   bell: {
//     icon: Bell,
//     bg: '#E4F5EC',
//     color: '#0F9D58',
//     badge: true,
//     badgeColor: '#F5A623',
//     action: navigation => navigation.navigate('Notifications'),
//   },
//   user: {
//     icon: User,
//     bg: '#E4F5EC',
//     color: '#0B7A43',
//     action: navigation => navigation.navigate('Profile'),
//   },
//   search: {
//     icon: Search,
//     bg: '#F1F3F1',
//     color: '#1E2A22',
//     action: navigation => navigation.navigate('SearchOrders'),
//   },
//   share: {
//     icon: Share2,
//     bg: '#FCEFE0',
//     color: '#B9670F',
//     action: navigation => navigation.navigate('Share'),
//   },
// };

const ICON_CONFIG = {
  back: {
    icon: ChevronLeft,
    bg: '#bdc3c733',
    color: '#2c3e50',
    action: navigation => navigation.goBack(),
  },
  menu: {
    icon: Menu,
    bg: '#F1F3F1',
    color: '#1E2A22',
    action: navigation => navigation.dispatch(DrawerActions.openDrawer()),
  },
  bell: {
    icon: Bell,
    bg: '#bdc3c733',
    color: '#2c3e50',
    badge: true,
    badgeColor: '#EA2027',
    action: navigation => navigation.navigate('Notifications'),
  },
  user: {
    icon: User,
    bg: '#bdc3c733',
    color: '#2c3e50',
    action: navigation => navigation.navigate('Profile'),
  },
  search: {
    icon: Search,
    bg: '#F1F3F1',
    color: '#1E2A22',
    action: navigation => navigation.navigate('SearchOrders'),
  },
  share: {
    icon: Share2,
    bg: '#FCEFE0',
    color: '#B9670F',
    action: navigation => navigation.navigate('Share'),
  },
};

const CustomHeader = ({
  title, // string shown in the center — only required prop besides icons
  leftIcon = 'back', // 'back' | 'menu'
  rightIcons = [], // e.g. ['bell', 'user']  or  ['share']  or  []
}) => {
  const navigation = useNavigation();

  const renderIcon = (key, side) => {
    const config = ICON_CONFIG[key];
    if (!config) return null;
    const LucideIcon = config.icon;

    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.iconBox,
          { backgroundColor: config.bg },
          side === 'right' && { marginLeft: 8 },
        ]}
        onPress={() => config.action(navigation)}
        activeOpacity={0.7}
      >
        <LucideIcon
          size={side === 'left' ? 22 : 20}
          color={config.color}
          strokeWidth={2}
        />
        {config.badge ? (
          <View
            style={[
              styles.badgeDot,
              { backgroundColor: config.badgeColor || '#F5A623' },
            ]}
          />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9F8" />
      <View style={[styles.container, styles.shadow]}>
        {/* LEFT */}
        <View style={styles.sideLeft}>{renderIcon(leftIcon, 'left')}</View>

        {/* CENTER */}
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* RIGHT */}
        <View style={styles.sideRight}>
          {rightIcons.map(key => renderIcon(key, 'right'))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,

    paddingTop: Platform.OS === 'ios' ? 0 : 4,
  },

  sideLeft: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1B2420',
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
    backgroundColor: '#D85A30',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});

export default CustomHeader;

/* =========================================================================
   USAGE — every screen only passes title + icon names, nothing else.
   ========================================================================= */

/*
import CustomHeader from '../components/CustomHeader';

// Dashboard — hamburger menu + bell + profile
<CustomHeader title="Dashboard" leftIcon="menu" rightIcons={['bell', 'user']} />

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
