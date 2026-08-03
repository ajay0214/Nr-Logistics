// ProfileScreen.js
// Clean, modern Profile Screen — React Native CLI, JavaScript only.
// No Expo, no UI libraries. Icons from lucide-react-native.
// Gradient hero header (react-native-linear-gradient) for an attractive
// background behind the avatar, with the rest of the content on a
// floating card layout.
//
// Colors + typography are pulled from the shared ThemeContext.js (the
// same one used by LoginScreen.js) instead of a local hardcoded
// LIGHT/DARK object, so this screen stays in sync with the rest of the
// app's theme, including persisted dark mode.

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  StatusBar,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../components/ThemeContext';
// import CustomBottomTab from './Custombottomtab';

import {
  Camera,
  Sun,
  Moon,
  Phone,
  Briefcase,
  BadgeCheck,
  User,
  MapPin,
  Bell,
  ShieldCheck,
  CircleHelp,
  Info,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';

const MENU_ITEMS = [
  { key: 'personal', label: 'Personal Information', Icon: User },
  { key: 'address', label: 'Delivery Address', Icon: MapPin },
  { key: 'notifications', label: 'Notifications', Icon: Bell },
  { key: 'security', label: 'Security', Icon: ShieldCheck },
  { key: 'help', label: 'Help', Icon: CircleHelp },
  { key: 'about', label: 'About', Icon: Info },
];

const ProfileScreen = ({ navigation }) => {
  const { isDark, colors, typography, toggleTheme } = useTheme();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [activeTab, setActiveTab] = useState('Profile');

  const styles = getStyles(colors, typography);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.gradientPrimary[0]}
        translucent
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Hero background ---------- */}
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Decorative accents */}
          <View style={styles.heroCircleLarge} />
          <View style={styles.heroCircleSmall} />
          <View style={styles.heroCircleTiny} />

          <View style={styles.headerRow}>
            <Text style={styles.screenTitle}>Profile</Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => toggleTheme(!isDark)}
              style={styles.themeButton}
            >
              {isDark ? (
                <Moon size={18} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <Sun size={18} color="#FFFFFF" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                style={styles.avatar}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.editBadge, { backgroundColor: colors.primary }]}
              >
                <Camera size={14} color="#FFFFFF" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>Ajay Kumar</Text>
            <Text style={styles.email}>ajay@gmail.com</Text>

            <View style={styles.badge}>
              <BadgeCheck size={13} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.badgeText}>Premium Member</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ---------- Floating content ---------- */}
        <View style={styles.contentWrapper}>
          {/* Profile Card */}
          <View style={[styles.card, styles.floatingCard]}>
            <InfoRow
              Icon={Phone}
              label="Phone Number"
              value="+91 98765 43210"
              colors={colors}
              styles={styles}
            />
            <View style={styles.divider} />
            <InfoRow
              Icon={BadgeCheck}
              label="Employee ID"
              value="LM-2048"
              colors={colors}
              styles={styles}
            />
            <View style={styles.divider} />
            <InfoRow
              Icon={Briefcase}
              label="Designation"
              value="Delivery Partner"
              colors={colors}
              styles={styles}
              last
            />
          </View>

          {/* Settings */}
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            <View style={[styles.menuRow, styles.rowBorder]}>
              <View style={styles.iconChip}>
                <Bell size={19} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.menuLabel}>Notifications</Text>
              <Switch
                value={notificationsOn}
                onValueChange={setNotificationsOn}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.menuRow}>
              <View style={styles.iconChip}>
                {isDark ? (
                  <Moon size={19} color={colors.primary} strokeWidth={2} />
                ) : (
                  <Sun size={19} color={colors.primary} strokeWidth={2} />
                )}
              </View>
              <Text style={styles.menuLabel}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          >
            <LogOut size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
      {/* <CustomBottomTab
        activeTab="Profile"
        onTabPress={tab => {
          setActiveTab(tab);

          switch (tab) {
            case 'Dashboard':
              navigation.navigate('Dashboard');
              break;

            case 'Orders':
              navigation.navigate('Orders');
              break;

            case 'Delivery':
              navigation.navigate('Delivery');
              break;

            case 'Profile':
              navigation.navigate('Profile');
              break;
          }
        }}
      /> */}
    </SafeAreaView>
  );
};

const InfoRow = ({ Icon, label, value, colors, styles, last }) => (
  <View style={[styles.infoRow, last && { marginBottom: 0 }]}>
    <View style={styles.iconChip}>
      <Icon size={18} color={colors.primary} strokeWidth={2} />
    </View>
    <View style={styles.infoTextWrapper}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// ---------------------------------------------------------------------------
// Styles are built from the shared theme (colors + typography) coming from
// ThemeContext.js, so this screen re-themes automatically with the rest of
// the app instead of relying on a local hardcoded LIGHT/DARK object.
// ---------------------------------------------------------------------------
const getStyles = (colors, typography) =>
  StyleSheet.create({
    safeArea: { flex: 1 },
    scrollContent: { paddingBottom: 16 },

    // ---------- Hero ----------
    hero: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 26,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      overflow: 'hidden',
    },
    heroCircleLarge: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      top: -70,
      right: -50,
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    heroCircleSmall: {
      position: 'absolute',
      width: 110,
      height: 110,
      borderRadius: 55,
      bottom: -40,
      left: -30,
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    heroCircleTiny: {
      position: 'absolute',
      width: 44,
      height: 44,
      borderRadius: 22,
      top: 70,
      left: 28,
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 30,
    },
    screenTitle: {
      ...typography.h2,
      color: '#FFFFFF',
    },
    themeButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
    },
    avatarSection: { alignItems: 'center', marginTop: 12 },
    avatarWrapper: {
      width: 104,
      height: 104,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.85)',
    },
    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    name: {
      ...typography.h3,
      color: '#FFFFFF',
      marginTop: 12,
    },
    email: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginTop: 12,
      gap: 6,
    },
    badgeText: {
      ...typography.label,
      color: '#FFFFFF',
      marginLeft: 5,
    },

    // ---------- Content ----------
    contentWrapper: { paddingHorizontal: 20 },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    floatingCard: { marginTop: 26 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    infoTextWrapper: { marginLeft: 12 },
    infoLabel: {
      ...typography.caption,
      color: colors.subText,
      marginBottom: 2,
    },
    infoValue: {
      ...typography.bodyBold,
      color: colors.text,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginBottom: 14,
    },
    sectionTitle: {
      ...typography.label,
      color: colors.subText,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: 10,
      marginLeft: 2,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    iconChip: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.EditIconBack,
    },
    menuLabel: {
      ...typography.newbody,
      flex: 1,
      color: colors.text,
      marginLeft: 12,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      paddingVertical: 14,
      gap: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
      marginTop: 10,
    },
    logoutText: {
      ...typography.button,
      color: '#FFFFFF',
      marginLeft: 8,
    },
  });

export default ProfileScreen;
