import React, { useState } from 'react';
import {
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowRight,
  Check,
} from 'lucide-react-native';

const COLORS = {
  primary: '#2B57F5',
  secondary: '#92a8f54d',
  background: '#F8FAFC',
  textDark: '#111827',
  textSecondary: '#6B7280',
  border: '#DCE7FF',
  white: '#FFFFFF',
  black: '#000000',
  blue: '#EAF2FF',
};

const RADIUS = 18;
const INPUT_HEIGHT = 64;
const BUTTON_HEIGHT = 58;

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_SOURCE_WIDTH = 1729;
const BANNER_SOURCE_HEIGHT = 914;
const BANNER_ASPECT_RATIO = BANNER_SOURCE_WIDTH / BANNER_SOURCE_HEIGHT;
const BANNER_HEIGHT = SCREEN_WIDTH / BANNER_ASPECT_RATIO;

export default function LoginScreen() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                source={require('../assets/logisticsbanner.png')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.curveContainer}>
              <View style={styles.curve} />
            </View>

            <View style={styles.content}>
              <Image
                source={require('../assets/NRLogo.png')}
                style={styles.logoImage}
                resizeMode="center"
              />

              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Text style={styles.welcomeText}>
                  Welcome <Text style={styles.welcomeTextBlue}>back!</Text>
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Text style={styles.subtitleText}>
                  Sign in to manage your deliveries{'\n'}and shipments
                </Text>
              </View>

              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.inputRow}>
                <View style={styles.iconSquare}>
                  <Image
                    source={require('../assets/phone.png')}
                    style={styles.inputIcon}
                  />
                </View>

                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={mobile}
                  onChangeText={setMobile}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <View style={styles.iconSquare}>
                  <Image
                    source={require('../assets/lock.png')}
                    style={styles.inputIcon}
                  />
                </View>
                <TextInput
                  style={[styles.inputField, { marginLeft: 5 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye size={20} color={COLORS.textSecondary} />
                  ) : (
                    <EyeOff size={20} color={COLORS.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

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
                      <Check size={13} color={COLORS.white} strokeWidth={3} />
                    )}
                  </View>
                  <Text style={styles.rememberText}>Remember Me</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity activeOpacity={0.85}>
                <LinearGradient
                  colors={['#3B6BFF', '#2B57F5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                  <ArrowRight
                    size={20}
                    color={COLORS.white}
                    style={styles.loginArrow}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.blue,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  heroWrapper: {
    width: SCREEN_WIDTH,
    // height: BANNER_HEIGHT,
    height: 280,
    backgroundColor: '#EAF2FF',
    overflow: 'hidden',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    // height: BANNER_HEIGHT,
    height: 280,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.background,
  },

  logoImage: {
    width: 200,

    marginTop: -60,
    marginBottom: -10,
    marginLeft: 80,
  },

  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  welcomeTextBlue: {
    color: COLORS.primary,
  },
  subtitleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
    marginLeft: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: INPUT_HEIGHT,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    paddingHorizontal: 14,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    shadowColor: '#2B57F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  iconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginRight: 8,
  },
  chevronIcon: {
    marginLeft: 4,
    marginRight: 12,
  },
  inputDivider: {
    width: 1,
    height: 26,
    backgroundColor: COLORS.border,
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
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
    borderColor: '#B9C2D6',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  curveContainer: {
    backgroundColor: '#EAF2FF', // Same as banner background
  },

  curve: {
    height: 60,
    backgroundColor: COLORS.background,
  },

  content: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  loginButton: {
    flexDirection: 'row',
    height: BUTTON_HEIGHT,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
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
  inputIcon: {
    width: 22,
    height: 22,
    tintColor: '#2B57F5', // Remove this if the PNG is already blue
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EA4335',
    marginRight: 8,
  },
  appleIcon: {
    fontSize: 20,
    color: COLORS.black,
    marginRight: 8,
  },
  socialText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
