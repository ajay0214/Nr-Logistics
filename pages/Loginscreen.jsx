import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme, Fonts } from '../components/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
import { store } from '../App';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowRight,
  Check,
} from 'lucide-react-native';

const RADIUS = 18;
const INPUT_HEIGHT = 64;
const BUTTON_HEIGHT = 58;

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_SOURCE_WIDTH = 1729;
const BANNER_SOURCE_HEIGHT = 1120;
const BANNER_ASPECT_RATIO = BANNER_SOURCE_WIDTH / BANNER_SOURCE_HEIGHT;
const BANNER_HEIGHT = SCREEN_WIDTH / BANNER_ASPECT_RATIO;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('ravi.kumar@example.com');
  const [password, setPassword] = useState('Ravi@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { isDark, colors, typography } = useTheme();

  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------------------
  // Validation state
  // ---------------------------------------------------------------------
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const styles = getStyles(colors, typography);

  // ---------------------------------------------------------------------
  // Validation logic
  // ---------------------------------------------------------------------
  const validateEmail = value => {
    if (!value || value.trim().length === 0) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return 'Enter a valid email address';
    }
    return '';
  };

  const validatePassword = value => {
    if (!value || value.length === 0) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleEmailChange = value => {
    setEmail(value);
    if (emailError) {
      setEmailError(validateEmail(value));
    }
  };

  const handlePasswordChange = value => {
    setPassword(value);
    if (passwordError) {
      setPasswordError(validatePassword(value));
    }
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      const url = store.getState().globalurl.loginUrl;
      const AuthUrl = store.getState().globalurl.Authorization;

      const data = {
        Query: {
          usermailid: email,
          password: password,
        },
      };

      console.log('URL :', url);
      console.log('Request :', JSON.stringify(data));

      const response = await axios.get(url, {
        params: {
          data: JSON.stringify(data),
        },
        headers: {
          Authorization: AuthUrl,
        },
      });

      console.log('Response :', response.data);

      if (response.data.Status === 'Y') {
        const userData = response.data.Data;
        console.log('User Data :', userData);

        await AsyncStorage.setItem('UserData', JSON.stringify(userData));
        setLoading(false);

        navigation.replace('BottomTab');
      } else {
        setLoading(false);

        Alert.alert('Login Failed', response.data.Message);
      }
    } catch (error) {
      console.log('Login Error :', error);
      setLoading(false);
      Alert.alert('Error', 'Something went wrong');
    }
  };
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.heroWrapper}>
              <Image
                source={
                  isDark
                    ? require('../assets/logisticsLogo.png')
                    : require('../assets/logisticsLogo.png')
                }
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.content}>
              <View style={styles.logoRow}>
                <Image
                  source={require('../assets/NRLogo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                {/* <Text style={styles.logoText}>
                  Logi<Text style={styles.logoTextGreen}>Move</Text>
                </Text> */}
              </View>

              <Text style={styles.welcomeText}>
                Welcome <Text style={styles.welcomeTextGreen}>back!</Text>
              </Text>

              <Text style={styles.label}>Email</Text>
              <View
                style={[
                  styles.inputRow,
                  emailError ? styles.inputRowError : null,
                ]}
              >
                <View style={styles.iconSquare}>
                  <Mail size={18} color="#FFFFFF" />
                </View>

                <TextInput
                  style={styles.inputField}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.subText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={handleEmailChange}
                  onBlur={() => setEmailError(validateEmail(email))}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}

              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputRow,
                  passwordError ? styles.inputRowError : null,
                ]}
              >
                <View style={styles.iconSquare}>
                  <Lock size={18} color="#FFFFFF" />
                </View>
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.subText}
                  //secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={handlePasswordChange}
                  onBlur={() => setPasswordError(validatePassword(password))}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye size={20} color={colors.subText} />
                  ) : (
                    <EyeOff size={20} color={colors.subText} />
                  )}
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked,
                    ]}
                  >
                    {rememberMe && (
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </View>
                  <Text style={styles.rememberText}>Remember Me</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity activeOpacity={0.85} onPress={handleLogin}>
                <LinearGradient
                  colors={colors.gradientPrimary}
                  style={styles.loginButton}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Login</Text>

                      <ArrowRight
                        size={20}
                        color="#FFFFFF"
                        style={styles.loginArrow}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles are built from the shared theme (colors + typography) coming from
// ThemeContext.js, so this screen re-themes automatically with the rest of
// the app (dark mode, brand color changes, etc.) instead of relying on a
// local hardcoded COLORS object.
// ---------------------------------------------------------------------------
const getStyles = (colors, typography) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      backgroundColor: colors.background,
    },
    heroWrapper: {
      width: SCREEN_WIDTH,
      height: 320,
      overflow: 'hidden',
    },

    heroImage: {
      width: '100%',
      height: '100%',
    },
    heroTextWrapper: {
      position: 'absolute',
      top: 24,
      left: 24,
    },
    heroTitleLine1: {
      ...typography.h3,
      fontFamily: Fonts.headingExtraBold,
      fontSize: 22,
      color: colors.text,
      lineHeight: 26,
    },
    heroTitleLine2: {
      ...typography.h3,
      fontFamily: Fonts.headingExtraBold,
      fontSize: 22,
      color: colors.primary,
      lineHeight: 26,
    },
    heroSubtitle: {
      ...typography.caption,
      color: colors.subText,
      marginTop: 6,
      lineHeight: 16,
    },
    content: {
      backgroundColor: colors.background,

      marginTop: 45,

      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,

      paddingTop: 25,
      paddingHorizontal: 24,
      paddingBottom: 32,

      zIndex: 10,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
      marginTop: -40,
    },
    logoImage: {
      width: 300,
      height: 48,
      marginRight: 8,
    },
    logoText: {
      fontFamily: Fonts.headingExtraBold,
      fontSize: 22,
      color: colors.text,
    },
    logoTextGreen: {
      color: colors.primary,
    },
    welcomeText: {
      ...typography.h2,
      color: colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    welcomeTextGreen: {
      color: colors.primary,
    },
    subtitleText: {
      ...typography.subtitle,
      color: colors.subText,
      marginBottom: 14,
      textAlign: 'center',
    },
    label: {
      fontFamily: Fonts.headingSemiBold,
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: INPUT_HEIGHT,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: RADIUS,
      paddingHorizontal: 14,
      marginBottom: 16,
      backgroundColor: colors.card,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    inputRowError: {
      borderColor: '#E53935',
    },
    errorText: {
      fontFamily: Fonts.bodyRegular,
      fontSize: 12,
      color: '#E53935',
      marginTop: -12,
      marginBottom: 14,
      marginLeft: 4,
    },
    iconSquare: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    countryCode: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: 15,
      color: colors.text,
      marginRight: 8,
    },
    chevronIcon: {
      marginLeft: 4,
      marginRight: 12,
    },
    inputDivider: {
      width: 1,
      height: 26,
      backgroundColor: colors.border,
      marginRight: 12,
    },
    inputField: {
      flex: 1,
      fontFamily: Fonts.bodyRegular,
      fontSize: 15,
      color: colors.text,
      padding: 0,
    },
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 28,
    },
    rememberRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.border,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    rememberText: {
      fontFamily: Fonts.bodyMedium,
      fontSize: 13,
      color: colors.text,
    },
    forgotText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: 13,
      color: colors.primary,
    },
    loginButton: {
      flexDirection: 'row',
      height: BUTTON_HEIGHT,
      borderRadius: RADIUS,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    loginButtonText: {
      fontFamily: Fonts.headingSemiBold,
      color: '#FFFFFF',
      fontSize: 16,
    },
    loginArrow: {
      marginLeft: 8,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontFamily: Fonts.bodyRegular,
      fontSize: 13,
      color: colors.subText,
      marginHorizontal: 12,
    },
    socialRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48%',
      height: BUTTON_HEIGHT,
      borderRadius: RADIUS,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    googleG: {
      fontSize: 18,
      fontFamily: Fonts.headingExtraBold,
      color: '#EA4335',
      marginRight: 8,
    },
    appleIcon: {
      fontSize: 20,
      color: colors.text,
      marginRight: 8,
    },
    socialText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: 15,
      color: colors.text,
    },
    signupRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
    signupText: {
      fontFamily: Fonts.bodyRegular,
      fontSize: 13,
      color: colors.subText,
    },
    signupLink: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: 13,
      color: colors.primary,
    },
  });
