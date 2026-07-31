import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CustomHeader from '../components/CustomHeader';
import CustomBottomTab from './Custombottomtab';
import Dashboard from './Dashboard';
import Orders from './Orders';
import Delivery from './Delivery';
import Profile from './Profile';
import { useTheme } from '../components/ThemeContext';

/* ------------------------------------------------------------------ */
/* Header config per tab.                                              */
/* `null` means: don't render the shared CustomHeader for this tab —   */
/* Dashboard already renders its own header (the navy GreetingCard     */
/* with the logo + bell, embedded inside DashboardScreen). Every other */
/* tab uses the plain title-based CustomHeader.                        */
/* ------------------------------------------------------------------ */
const TAB_HEADER_CONFIG = {
  Dashboard: null,
  Orders: { title: 'Orders', leftIcon: 'menu', rightIcons: ['search', 'bell'] },
  Delivery: { title: 'Delivery', leftIcon: 'menu', rightIcons: ['bell'] },
  Profile: { title: 'Profile', leftIcon: 'menu', rightIcons: ['bell', 'user'] },
};

export default function HomeLayout({ navigation }) {
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [visitedTabs, setVisitedTabs] = useState(() => new Set(['Dashboard']));

  const selectTab = tab => {
    setActiveTab(tab);
    setVisitedTabs(prev => (prev.has(tab) ? prev : new Set(prev).add(tab)));
  };

  const headerConfig = TAB_HEADER_CONFIG[activeTab];

  // Every screen gets `navigation` (for any drill-down pushes it still
  // needs, e.g. Order details) plus `onNavigateTab` (for switching
  // between the four bottom tabs without pushing a new stack screen —
  // this replaces the old `navigation.navigate('Orders')` calls that
  // used to live inside DashboardScreen's CustomBottomTab).
  const screenProps = {
    navigation,
    onNavigateTab: selectTab,
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {headerConfig && (
        <CustomHeader
          title={headerConfig.title}
          leftIcon={headerConfig.leftIcon}
          rightIcons={headerConfig.rightIcons}
        />
      )}

      <View style={styles.content}>
        {visitedTabs.has('Dashboard') && (
          <View style={tabStyle(activeTab === 'Dashboard')}>
            <Dashboard {...screenProps} />
          </View>
        )}
        {visitedTabs.has('Orders') && (
          <View style={tabStyle(activeTab === 'Orders')}>
            <Orders {...screenProps} />
          </View>
        )}
        {visitedTabs.has('Delivery') && (
          <View style={tabStyle(activeTab === 'Delivery')}>
            <Delivery {...screenProps} />
          </View>
        )}
        {visitedTabs.has('Profile') && (
          <View style={tabStyle(activeTab === 'Profile')}>
            <Profile {...screenProps} />
          </View>
        )}
      </View>

      <CustomBottomTab
        activeTab={activeTab}
        onTabPress={selectTab}
        cartCount={0}
      />
    </View>
  );
}

const tabStyle = active => [
  StyleSheet.absoluteFill,
  { display: active ? 'flex' : 'none' },
];

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, position: 'relative' },
});
