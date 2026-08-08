import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
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

import { useTheme } from '../components/ThemeContext';
import Dashboard from './Dashboard';
import Orders from './Orders';
import Delivery from './Delivery';
import Profile from './Profile';

const Tab = createBottomTabNavigator();

// Now maps each route name to a lucide-react-native icon component
// instead of an image require() — swap any of these for a different
// lucide icon whenever you like, no other code needs to change.
const TAB_ICONS = {
  Overview: LayoutDashboard,
  Pickup: ShoppingBag,
  Delivery: Truck,
  Profile: User,
};

function CustomTabBar({ state, descriptors, navigation }) {
  const { colors, isDark } = useTheme();
  const accentColor = colors.primary || '#6C5DD3';

  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const hideTabBar = focusedOptions?.tabBarStyle?.display === 'none';

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(enabled => {
        if (mounted) reduceMotionRef.current = enabled;
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Bar slides up + fades in once, on mount.
  useEffect(() => {
    if (reduceMotionRef.current) {
      barEntrance.setValue(1);
      return;
    }
    Animated.timing(barEntrance, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Every time the active tab changes, spring each tab's focus value
  // toward 1 (active) or 0 (inactive) — this drives the lift, the
  // icon crossfade, and the label reveal all from one animated value.
  useEffect(() => {
    focusAnims.forEach((anim, i) => {
      const toValue = i === state.index ? 1 : 0;
      if (reduceMotionRef.current) {
        anim.setValue(toValue);
        return;
      }
      Animated.spring(anim, {
        toValue,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index]);

  // ---- double back press to exit (moved above any early return) ----
  const backPressCount = useRef(0);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (backPressCount.current === 1) {
          BackHandler.exitApp();
          return true;
        }

        backPressCount.current = 1;

        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);

        setTimeout(() => {
          backPressCount.current = 0;
        }, 2000);

        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  // ---- animation state (all hooks declared unconditionally, every render) ----
  const barEntrance = useRef(new Animated.Value(0)).current;

  const focusAnimsRef = useRef(null);
  if (!focusAnimsRef.current) {
    focusAnimsRef.current = state.routes.map(
      (_, i) => new Animated.Value(i === state.index ? 1 : 0),
    );
  }
  const focusAnims = focusAnimsRef.current;

  const pressScalesRef = useRef(null);
  if (!pressScalesRef.current) {
    pressScalesRef.current = state.routes.map(() => new Animated.Value(1));
  }
  const pressScales = pressScalesRef.current;

  const reduceMotionRef = useRef(false);

  if (hideTabBar) {
    return null;
  }

  const barTranslateY = barEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.tabBackground,
            borderColor: isDark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.045)',
            opacity: barEntrance,
            transform: [{ translateY: barTranslateY }],
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const IconComponent = TAB_ICONS[route.name];
          const focusAnim = focusAnims[index];
          const pressScale = pressScales[index];

          const lift = focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -16],
          });
          const iconScale = focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.08],
          });
          const mutedOpacity = focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          });
          const labelTranslate = focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [4, 0],
          });
          const labelOpacity = focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.65, 1],
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onPressIn = () => {
            Animated.spring(pressScale, {
              toValue: 0.88,
              useNativeDriver: true,
              speed: 50,
              bounciness: 0,
            }).start();
          };

          const onPressOut = () => {
            Animated.spring(pressScale, {
              toValue: 1,
              useNativeDriver: true,
              speed: 20,
              bounciness: 6,
            }).start();
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={
                typeof label === 'string' ? label : route.name
              }
              onPress={onPress}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={1}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              style={styles.tabItem}
            >
              <Animated.View
                style={[
                  styles.iconStack,
                  {
                    transform: [
                      { translateY: lift },
                      { scale: iconScale },
                      { scale: pressScale },
                    ],
                  },
                ]}
              >
                {/* Resting state */}
                <Animated.View
                  style={[styles.circle, { opacity: mutedOpacity }]}
                >
                  <IconComponent
                    size={20}
                    color={isDark ? '#FFFFFF' : '#8A8A9A'}
                    strokeWidth={2}
                  />
                </Animated.View>

                {/* Raised, glowing active state — crossfades in over the resting icon */}
                <Animated.View
                  style={[
                    styles.circle,
                    styles.circleActive,
                    {
                      opacity: focusAnim,
                      backgroundColor: accentColor,
                      shadowColor: accentColor,
                    },
                  ]}
                >
                  <IconComponent size={20} color="#FFFFFF" strokeWidth={2} />
                </Animated.View>
              </Animated.View>

              <Animated.Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    color: isFocused
                      ? accentColor
                      : colors.subText || '#9AA0A6',
                    fontWeight: isFocused ? '700' : '500',
                    opacity: labelOpacity,
                    transform: [{ translateY: labelTranslate }],
                  },
                ]}
              >
                {label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
}

export default function BottomTab({ route }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.tabBackground }}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            display: route?.params?.hideTabBar ? 'none' : 'flex',
          },
        })}
      >
        <Tab.Screen name="Overview" component={Dashboard} />
        <Tab.Screen name="Pickup" component={Orders} />
        <Tab.Screen name="Delivery" component={Delivery} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingBottom: 2,
  },
  tabBar: {
    flexDirection: 'row',
    width: '100%',
    height: 78,

    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  iconStack: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    fontSize: 11,
    paddingBottom: 8,
  },
});
