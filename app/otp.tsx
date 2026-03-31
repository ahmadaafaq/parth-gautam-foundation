import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { authAPI } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn } from '@clerk/clerk-expo';

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const setUser = useAuthStore((state) => state.setUser);
  const { t } = useLanguageStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const { signIn, isLoaded, setActive } = useSignIn();

  const handleVerify = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length < 6) {
      Alert.alert(t('error'), 'Please enter the complete 6-digit OTP');
      return;
    }

    if (!phone) {
      Alert.alert(t('error'), 'Phone number is missing. Please try again.');
      router.back();
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    try {
      // Step 1: Verify OTP with Clerk
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: 'phone_code',
        code: enteredOtp,
      });

      if (completeSignIn.status === 'complete') {
        // Step 2: Set the active session
        await setActive({ session: completeSignIn.createdSessionId });

        // Step 3: Fetch app-specific user profile
        const user = await authAPI.login(phone);
        setUser(user);
      } else {
        console.error('SignIn incomplete:', completeSignIn);
        Alert.alert(t('error'), 'Verification incomplete. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', JSON.stringify(error, null, 2));
      const errMsg = error.errors?.[0]?.longMessage || error.errors?.[0]?.message || 'Invalid OTP. Please check and try again.';
      Alert.alert(
        'Login Failed',
        errMsg,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={20} color="#1E293B" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark-outline" size={36} color="#2563EB" />
          </View>
          <Text style={styles.title}>{t('verifyOtp')}</Text>
          <Text style={styles.subtitle}>
            {t('otpSentTo')?.replace('{phone}', phone?.startsWith('+') ? phone : `+91 ${phone}`) || `Enter the 6-digit code sent to ${phone?.startsWith('+') ? phone : `+91 ${phone}`}`}
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* <Text style={styles.hintText}>
            For testing purposes, use <Text style={{ fontWeight: 'bold' }}>1234</Text>
          </Text> */}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={styles.btnText}>{t('pleaseWait')}...</Text>
            ) : (
              <View style={styles.btnInner}>
                <Text style={styles.btnText}>{t('verifyOtp')}</Text>
                <Ionicons name="checkmark" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  hintText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 32,
  },
  btn: {
    backgroundColor: '#2563EB',
    paddingVertical: 17,
    borderRadius: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
