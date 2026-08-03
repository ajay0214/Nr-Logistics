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
  headingBlack: 'Poppins-Black',

  // Inter → Body
  bodyRegular: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
};

export const typography = {
  // Screen Title (Top level)

  h: {
    fontFamily: Fonts.headingBlack,

    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0.3,
    fontWeight: 700,
  },
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
// Palette lifted from the LogiMove screens: navy brand blue,
// navy headline text, soft blue-gray page background, with blue /
// orange / navy used for delivery status states (In Transit /
// Picked Up / Delivered). All former green tones replaced with #203778.
export const ThemeLight = {
  Mode: 'Light',
  Background: '#F7F8FA', // page background behind cards
  CardBackground: '#FFFFFF', // stat cards, list cards
  SectionBackground: '#F2F4F5', // grouped list / section backgrounds
  Border: '#E5E7EB',
  InputBackground: '#F9FAFB', // mobile number / password fields
  SpecialButtonBackground: '#203778',
  TextPrimary: '#0F172A', // "Welcome back!" navy-black
  TextSecondary: 'rgba(15,23,42,0.55)', // subtitles, helper copy
  TextDisabled: 'rgba(15,23,42,0.35)', // placeholder text
  TextAccent: '#203778', // "back!", "Move", links
  loader: '#203778',
  IconColor: '#0F172A',
  ChipBG: '#203778',

  // Brand
  BrandPrimary: '#203778', // LogiMove brand blue
  BrandSecondary: '#0F2A3D', // deep navy accent

  // Gradients (use with react-native-linear-gradient)
  GradientPrimary: ['#203778', '#0EA5E9'], // Login button gradient
  GradientHeader: ['#203778', '#EAF6FF'], // hero header wash

  UploadBoxBackground: '#203778',
  UploadBoxTextcolor: '#0F172A',
  ShareBtnBackground: '#DBEAFE',
  UploadGigBg: '#203778',
  GigTextColor: '#203778',

  ButtonPrimaryBG: '#203778', // Login / primary CTA
  ButtonPrimaryText: '#FFFFFF',
  ButtonSecondaryBG: '#0F2A3D',
  ButtonTertiaryBG: '#2853AF',
  ButtonSecondaryText: '#FFFFFF',
  ButtonGhostIcon: '#6B7280',

  SecondaryContainer: '#203778',
  Success: '#203778', // Delivered, positive trend
  Warning: '#F59E0B', // Pending Pickups, Picked Up
  Error: '#EF4444',
  Iconsplcolor: '#3B82F6', // In Transit blue accents
  VerifiedBG: '#203778',
  StandardColor: '#FFFFFF',
  ChartColor: '#203778', // sparkline stroke color

  NavbarbgColour: '#203778',
  NavbarTextColour: '#FFFFFF',
  TitleBarbgColour: '#F2F4F5',
  TitleBarTextColour: '#0F2A3D',
  pricingButtonColor: '#203778',
  HighlightBG: '#DBEAFE', // In Transit badge bg
  HighlightAltBG: '#FEF3C7', // Picked Up / pending badge bg

  // Delivery status accents (badges + recent activity dots)
  StatusInTransitBG: '#DBEAFE',
  StatusInTransitText: '#3B82F6',
  StatusPickedUpBG: '#FEF3C7',
  StatusPickedUpText: '#F59E0B',
  StatusDeliveredBG: '#203778',
  StatusDeliveredText: '#203778',
  StatusDeliveredNewBG: '#4970dc',

  // Trend pills on stat cards
  TrendUpBG: '#203778',
  TrendUpText: '#203778',
  TrendDownBG: '#FEF3C7',
  TrendDownText: '#F59E0B',

  // Bottom tab bar
  BottomTabBG: '#FFFFFF',
  BottomTabActiveBG: '#203778',
  BottomTabActiveText: '#203778',
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
  SpecialButtonBackground: '#203778',
  TextPrimary: '#F5F5F5',
  TextSecondary: 'rgba(245,245,245,0.6)',
  TextDisabled: 'rgba(245,245,245,0.35)',
  TextAccent: '#203778',
  loader: '#203778',
  IconColor: '#F5F5F5',
  ChipBG: '#203778',

  BrandPrimary: '#203778',
  BrandSecondary: '#67C1E8',

  GradientPrimary: ['#203778', '#0284C7'],
  GradientHeader: ['#203778', '#0E1B24'],

  UploadBoxBackground: '#203778',
  UploadBoxTextcolor: '#F5F5F5',
  ShareBtnBackground: '#123049',
  UploadGigBg: '#203778',
  GigTextColor: '#203778',

  ButtonPrimaryBG: '#203778',
  ButtonPrimaryText: '#F5F5F5',
  ButtonSecondaryBG: '#123049',
  ButtonTertiaryBG: '#2853AF',
  ButtonSecondaryText: '#FFFFFF',
  ButtonGhostIcon: '#9CA3AF',

  SecondaryContainer: '#203778',
  Success: '#203778',
  Warning: '#FBBF24',
  Error: '#F87171',
  Iconsplcolor: '#60A5FA',
  VerifiedBG: '#203778',
  StandardColor: '#FFFFFF',
  ChartColor: '#203778',

  NavbarbgColour: '#203778',
  NavbarTextColour: '#FFFFFF',
  TitleBarbgColour: '#151B19',
  TitleBarTextColour: '#203778',
  pricingButtonColor: '#203778',
  HighlightBG: '#123049',
  HighlightAltBG: '#3D2E20',

  StatusInTransitBG: '#123049',
  StatusInTransitText: '#60A5FA',
  StatusPickedUpBG: '#3D2E20',
  StatusPickedUpText: '#FBBF24',
  StatusDeliveredBG: '#203778',
  StatusDeliveredText: '#203778',

  TrendUpBG: '#203778',
  TrendUpText: '#203778',
  TrendDownBG: '#3D2E20',
  TrendDownText: '#FBBF24',

  BottomTabBG: '#151B19',
  BottomTabActiveBG: '#203778',
  BottomTabActiveText: '#203778',
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
    EditIconBack: isDark
      ? 'rgba(32, 55, 120, 0.15)'
      : 'rgba(32, 55, 120, 0.10)',

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
    DarkGreenColor: '#203778',
    Main: '#203778',
    primary: '#203778',
    secondary: isDark ? '#67C1E8' : '#0EA5E9',

    // Login-button style gradients (pair with react-native-linear-gradient)
    gradientPrimary: isDark ? ['#203778', '#0284C7'] : ['#203778', '#0EA5E9'],

    NavbarbgColour: '#203778',
    NavbarTextColour: '#FFFFFF',

    // Delivery status colors (badges, activity dots)
    statusInTransitBg: isDark ? '#123049' : '#DBEAFE',
    statusInTransitText: isDark ? '#60A5FA' : '#3B82F6',
    statusPickedUpBg: isDark ? '#3D2E20' : '#FEF3C7',
    statusPickedUpText: isDark ? '#FBBF24' : '#F59E0B',
    statusDeliveredBg: '#203778',
    statusDeliveredText: '#203778',
    StatusDeliveredNewBG: '#90a1d14f',

    TodaysProgress: isDark ? '#979ba014' : '#F4F7FD',

    // Stat-card trend pills
    trendUpBg: '#203778',
    trendUpText: '#203778',
    trendDownBg: isDark ? '#3D2E20' : '#FEF3C7',
    trendDownText: isDark ? '#FBBF24' : '#F59E0B',

    // Bottom tab bar (active pill look from the dashboard screenshot)
    bottomTabBg: isDark ? '#151B19' : '#FFFFFF',
    bottomTabActiveBg: '#203778',
    bottomTabActiveText: '#203778',
    bottomTabInactiveText: isDark ? '#9CA3AF' : '#6B7280',

    modalOverlay: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
    modalCard: isDark ? '#151B19' : '#FFFFFF',
    modalBorder: isDark ? '#25302C' : '#E5E7EB',
    modalItemActive: isDark ? '#203778' : '#203778',
    PROGRESS_ACCENT1: isDark ? '#FFFFFF' : '#203778',
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
