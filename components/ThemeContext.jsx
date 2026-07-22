// ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Text.defaultProps = Text.defaultProps ?? {};
Text.defaultProps.style = [{ fontFamily: 'Poppins-Regular', color: '#000' }];

export const Fonts = {
  // Poppins → Headings
  headingRegular: 'Poppins-Regular',
  headingMedium: 'Poppins-Medium',
  headingSemiBold: 'Poppins-SemiBold',
  headingBold: 'Poppins-Bold',
  headingExtraBold: 'Poppins-ExtraBold',

  // Inter → Body
  bodyRegular: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
};

export const typography = {
  // Screen Title (Top level)
  h1: {
    fontFamily: Fonts.headingExtraBold,
    fontSize: 26,
    lineHeight: 36,
    letterSpacing: 0.3,
  },

  // Section Title
  h2: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 20,
    lineHeight: 30,
  },

  // Card Title / Important text
  h3: {
    fontFamily: Fonts.headingMedium,
    fontSize: 16,
    lineHeight: 24,
  },

  // Sub heading
  subtitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 22,
  },

  // Body text (main content)
  body: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 22,
  },

  newbody: {
    fontFamily: Fonts.headingMedium,
    fontSize: 15,
    lineHeight: 22,
  },

  // Bold body
  bodyBold: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 22,
  },

  bodySubText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 22,
  },

  // Small / helper text
  caption: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
  },

  // Label (input, tags)
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
  },

  small: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 10,
    lineHeight: 13,
  },

  // Button text
  button: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
};

// ---------------- Captions ----------------
const captions = {
  welcomeTitle: {
    ...typography.h1,
    color: '#0F172A',
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    ...typography.subtitle,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    ...typography.h3,
    color: '#111827',
    textAlign: 'left',
  },
  sectionSubtitle: {
    ...typography.caption,
    color: '#6B7280',
    textAlign: 'justify',
  },
  dividerText: {
    ...typography.caption,
    color: '#9CA3AF',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  buttonText: {
    ...typography.button,
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 8,
  },
};

export const Spacing = {
  XXS: 4,
  XS: 8,
  S: 12,
  M: 16,
  MM: 20,
  L: 24,
  XL: 32,
  XXL: 40,
};

export const Radius = {
  XXS: 4,
  XS: 8,
  S: 12,
  M: 16,
  L: 24,
  XL: 32,
  XXL: 40,
};

// ---------------- Light & Dark Themes ----------------
// Palette lifted from the LogiMove screens: emerald/teal brand green,
// navy headline text, soft blue-gray page background, with blue /
// orange / green used for delivery status states (In Transit /
// Picked Up / Delivered).
export const ThemeLight = {
  Mode: 'Light',
  Background: '#F7F8FA', // page background behind cards
  CardBackground: '#FFFFFF', // stat cards, list cards
  SectionBackground: '#F2F4F5', // grouped list / section backgrounds
  Border: '#E5E7EB',
  InputBackground: '#F9FAFB', // mobile number / password fields
  SpecialButtonBackground: '#ECFDF5',
  TextPrimary: '#0F172A', // "Welcome back!" navy-black
  TextSecondary: 'rgba(15,23,42,0.55)', // subtitles, helper copy
  TextDisabled: 'rgba(15,23,42,0.35)', // placeholder text
  TextAccent: '#10B981', // "back!", "Move", links
  loader: '#10B981',
  IconColor: '#0F172A',
  ChipBG: '#F0FDF9',

  // Brand
  BrandPrimary: '#10B981', // LogiMove emerald green
  BrandSecondary: '#0F2A3D', // deep navy accent

  // Gradients (use with react-native-linear-gradient)
  GradientPrimary: ['#10B981', '#0EA5E9'], // Login button gradient
  GradientHeader: ['#E9FBF3', '#EAF6FF'], // hero header wash

  UploadBoxBackground: '#ECFDF5',
  UploadBoxTextcolor: '#0F172A',
  ShareBtnBackground: '#DBEAFE',
  UploadGigBg: '#E6F9EF',
  GigTextColor: '#10B981',

  ButtonPrimaryBG: '#10B981', // Login / primary CTA
  ButtonPrimaryText: '#FFFFFF',
  ButtonSecondaryBG: '#0F2A3D',
  ButtonTertiaryBG: '#2853AF',
  ButtonSecondaryText: '#FFFFFF',
  ButtonGhostIcon: '#6B7280',

  SecondaryContainer: '#D1FAE5',
  Success: '#059669', // Delivered, positive trend
  Warning: '#F59E0B', // Pending Pickups, Picked Up
  Error: '#EF4444',
  Iconsplcolor: '#3B82F6', // In Transit blue accents
  VerifiedBG: '#D1FAE5',
  StandardColor: '#FFFFFF',
  ChartColor: '#10B981', // sparkline stroke color

  NavbarbgColour: '#10B981',
  NavbarTextColour: '#FFFFFF',
  TitleBarbgColour: '#F2F4F5',
  TitleBarTextColour: '#0F2A3D',
  pricingButtonColor: '#EAF7F1',
  HighlightBG: '#DBEAFE', // In Transit badge bg
  HighlightAltBG: '#FEF3C7', // Picked Up / pending badge bg

  // Delivery status accents (badges + recent activity dots)
  StatusInTransitBG: '#DBEAFE',
  StatusInTransitText: '#3B82F6',
  StatusPickedUpBG: '#FEF3C7',
  StatusPickedUpText: '#F59E0B',
  StatusDeliveredBG: '#D1FAE5',
  StatusDeliveredText: '#059669',

  // Trend pills on stat cards
  TrendUpBG: '#D1FAE5',
  TrendUpText: '#059669',
  TrendDownBG: '#FEF3C7',
  TrendDownText: '#F59E0B',

  // Bottom tab bar
  BottomTabBG: '#FFFFFF',
  BottomTabActiveBG: '#D1FAE5',
  BottomTabActiveText: '#059669',
  BottomTabInactiveText: '#6B7280',

  // Logo: require("../assets/logimove-logo.png"),
  AppTitle: 'LogiMove',
  AppTitleText: 'LogiMove - Delivery & Shipment Manager',
  typography,
  captions,
};

export const ThemeDark = {
  Mode: 'Dark',
  Background: '#0B1210',
  CardBackground: '#151B19',
  SectionBackground: '#10161',
  Border: '#25302C',
  InputBackground: '#1B2320',
  SpecialButtonBackground: '#132A22',
  TextPrimary: '#F5F5F5',
  TextSecondary: 'rgba(245,245,245,0.6)',
  TextDisabled: 'rgba(245,245,245,0.35)',
  TextAccent: '#34D399',
  loader: '#34D399',
  IconColor: '#F5F5F5',
  ChipBG: '#182420',

  BrandPrimary: '#34D399',
  BrandSecondary: '#67C1E8',

  GradientPrimary: ['#059669', '#0284C7'],
  GradientHeader: ['#0F1E1A', '#0E1B24'],

  UploadBoxBackground: '#132A22',
  UploadBoxTextcolor: '#F5F5F5',
  ShareBtnBackground: '#123049',
  UploadGigBg: '#132A22',
  GigTextColor: '#34D399',

  ButtonPrimaryBG: '#059669',
  ButtonPrimaryText: '#F5F5F5',
  ButtonSecondaryBG: '#123049',
  ButtonTertiaryBG: '#2853AF',
  ButtonSecondaryText: '#FFFFFF',
  ButtonGhostIcon: '#9CA3AF',

  SecondaryContainer: '#123B2E',
  Success: '#34D399',
  Warning: '#FBBF24',
  Error: '#F87171',
  Iconsplcolor: '#60A5FA',
  VerifiedBG: '#123B2E',
  StandardColor: '#FFFFFF',
  ChartColor: '#34D399',

  NavbarbgColour: '#0F2A22',
  NavbarTextColour: '#FFFFFF',
  TitleBarbgColour: '#151B19',
  TitleBarTextColour: '#34D399',
  pricingButtonColor: '#123B2E',
  HighlightBG: '#123049',
  HighlightAltBG: '#3D2E20',

  StatusInTransitBG: '#123049',
  StatusInTransitText: '#60A5FA',
  StatusPickedUpBG: '#3D2E20',
  StatusPickedUpText: '#FBBF24',
  StatusDeliveredBG: '#123B2E',
  StatusDeliveredText: '#34D399',

  TrendUpBG: '#123B2E',
  TrendUpText: '#34D399',
  TrendDownBG: '#3D2E20',
  TrendDownText: '#FBBF24',

  BottomTabBG: '#151B19',
  BottomTabActiveBG: '#123B2E',
  BottomTabActiveText: '#34D399',
  BottomTabInactiveText: '#9CA3AF',

  // Logo: require("../assets/logimove-logo-dark.png"),
  AppTitle: 'LogiMove',
  AppTitleText: 'LogiMove - Delivery & Shipment Manager',
  typography,
  captions,
};

// ---------------- Context Provider ----------------
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('darkMode');

        if (saved !== null) {
          setIsDark(saved === 'true');
        }
      } catch (e) {
        console.log('Error loading theme:', e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async value => {
    try {
      setIsDark(value);
      await AsyncStorage.setItem('darkMode', value.toString());
    } catch (e) {
      console.log('Error saving theme:', e);
    }
  };

  // Dynamic color lookup used via useTheme().colors — mirrors the
  // shape of ThemeLight / ThemeDark above but keyed for quick access
  // inside components (colors.background, colors.primary, etc.).
  const colors = {
    background: isDark ? '#0B1210' : '#F7F8FA',
    tanseparentbackground: isDark ? '#151b19b9' : '#f7f8fad2',
    chatbackground: isDark ? '#151B19' : '#F7F8FA',

    text: isDark ? '#F5F5F5' : '#0F172A',
    subText: isDark ? '#B0B0B0' : '#6B7280',

    Icon: isDark ? '#F5F5F5' : '#0F172A',
    EditIcon: isDark ? '#D1D5DB' : '#0F2A3D',
    EditIconBack: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(16,185,129,0.10)',

    DeleteIcon: isDark ? '#f87171b5' : '#E53E3E',
    DeleteIconBack: isDark
      ? 'rgba(248, 113, 113, 0.15)'
      : 'rgba(229,62,62,0.10)',

    card: isDark ? '#151B19' : '#FFFFFF',
    GrayText: isDark ? '#FFFFFF' : '#334155',

    tabBackground: isDark ? '#151B19' : '#FFFFFF',

    border: isDark ? '#25302C' : '#E5E7EB',
    line: isDark ? '#25302C' : '#E5E7EB',

    searchBackground: isDark ? '#1B2320' : '#FFFFFF',
    searchBorder: isDark ? '#25302C' : '#D9D9D9',

    NewColor: isDark ? '#d9d9d987' : '#c3bdbd80',

    shadow: '#000000',

    // Brand
    DarkGreenColor: '#059669',
    Main: isDark ? '#34D399' : '#10B981',
    primary: isDark ? '#34D399' : '#10B981',
    secondary: isDark ? '#67C1E8' : '#0EA5E9',

    // Login-button style gradients (pair with react-native-linear-gradient)
    gradientPrimary: isDark ? ['#059669', '#0284C7'] : ['#10B981', '#0EA5E9'],

    NavbarbgColour: isDark ? '#0F2A22' : '#10B981',
    NavbarTextColour: '#FFFFFF',

    // Delivery status colors (badges, activity dots)
    statusInTransitBg: isDark ? '#123049' : '#DBEAFE',
    statusInTransitText: isDark ? '#60A5FA' : '#3B82F6',
    statusPickedUpBg: isDark ? '#3D2E20' : '#FEF3C7',
    statusPickedUpText: isDark ? '#FBBF24' : '#F59E0B',
    statusDeliveredBg: isDark ? '#123B2E' : '#D1FAE5',
    statusDeliveredText: isDark ? '#34D399' : '#059669',

    // Stat-card trend pills
    trendUpBg: isDark ? '#123B2E' : '#D1FAE5',
    trendUpText: isDark ? '#34D399' : '#059669',
    trendDownBg: isDark ? '#3D2E20' : '#FEF3C7',
    trendDownText: isDark ? '#FBBF24' : '#F59E0B',

    // Bottom tab bar (active pill look from the dashboard screenshot)
    bottomTabBg: isDark ? '#151B19' : '#FFFFFF',
    bottomTabActiveBg: isDark ? '#123B2E' : '#D1FAE5',
    bottomTabActiveText: isDark ? '#34D399' : '#059669',
    bottomTabInactiveText: isDark ? '#9CA3AF' : '#6B7280',

    modalOverlay: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
    modalCard: isDark ? '#151B19' : '#FFFFFF',
    modalBorder: isDark ? '#25302C' : '#E5E7EB',
    modalItemActive: isDark ? '#123B2E' : '#ECFDF5',
  };

  // Optional: Prevent flicker before loading
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, colors, typography, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// import { useTheme } from '../ThemeContext';
//
// const { colors, isDark } = useTheme();
//
// <Text style={{ color: colors.text }}>
//   {isDark ? 'Dark Mode' : 'Light Mode'}
// </Text>
