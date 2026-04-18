import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  Pressable,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { authAPI, seedAPI } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignUp, useClerk } from '@clerk/clerk-expo';

const { width } = Dimensions.get('window');

// ─── Floating Label Input ────────────────────────────────────────────────────
interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: any;
  maxLength?: number;
  returnKeyType?: any;
  onSubmitEditing?: () => void;
  autoComplete?: any;
  required?: boolean;
}

const FloatingInput = React.forwardRef<TextInput, FloatingInputProps>((props, ref) => {
  const inputRef = useRef<TextInput>(null);

  React.useImperativeHandle(ref, () => inputRef.current!);
  const {
    label,
    value,
    onChangeText,
    keyboardType = 'default',
    maxLength,
    returnKeyType = 'next',
    onSubmitEditing,
    autoComplete,
    required,
  } = props;
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(anim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    if (!value) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelTop = anim.interpolate({ inputRange: [0, 1], outputRange: [17, 6] });
  const labelSize = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 11] });
  const labelColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#9CA3AF', focused ? '#2563EB' : '#6B7280'],
  });

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      style={[
        inputStyles.wrapper,
        focused && inputStyles.wrapperFocused,
      ]}
    >
      <Animated.Text
        pointerEvents="none"
        style={[
          inputStyles.floatingLabel,
          { top: labelTop, fontSize: labelSize, color: labelColor },
        ]}
      >
        {label}{required ? ' *' : ''}
      </Animated.Text>
      <TextInput
        ref={inputRef}
        style={inputStyles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType={keyboardType}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        autoComplete={autoComplete}
        autoCapitalize={keyboardType === 'default' ? 'words' : 'none'}
        autoCorrect={false}
        blurOnSubmit={returnKeyType === 'done'}
      />
    </Pressable>
  );
});

const inputStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingTop: 22,
    paddingBottom: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
  },
  wrapperFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    fontWeight: '500',
    zIndex: 1,
  },
  input: {
    fontSize: 16,
    color: '#1E293B',
    paddingTop: 4,
    paddingBottom: 4,
    minHeight: 44,
    margin: 0,
    width: '100%',
  },
});

// ─── Main Onboarding Screen ──────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const { t } = useLanguageStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [clerkStatus, setClerkStatus] = useState<string | null>(null);
  const { signUp, isLoaded, setActive } = useSignUp();
  const { client } = useClerk();

  const scrollRef = useRef<ScrollView>(null);

  // Refs for sequential focus
  const nameRef = useRef<TextInput>(null);
  const wardRef = useRef<TextInput>(null);

  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    age_group: '',
    ward: '',
    occupation: '',
    interests: [] as string[],
    gender: '',
    address: '',
    isVoter: null as boolean | null,
    consent: false,
  });

  const update = (key: keyof typeof formData) => (val: string) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  const interestOptions = [
    { id: 'healthcare', label: t('healthcare'), icon: 'medical-outline' },
    { id: 'education', label: t('education'), icon: 'school-outline' },
    { id: 'jobs', label: t('jobs'), icon: 'briefcase-outline' },
    { id: 'volunteer', label: t('volunteer'), icon: 'hand-right-outline' },
    { id: 'community', label: t('communityIssues'), icon: 'people-outline' },
  ];

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!verificationPending) {
        // Send OTP
        const digits = formData.phone.replace(/\D/g, '');
        if (digits.length < 10) {
          Alert.alert(t('error'), 'Please enter a valid 10-digit mobile number');
          return;
        }

        if (!isLoaded) return;
        setLoading(true);
        try {
          const finalPhone = formData.phone.trim().startsWith('+') ? formData.phone.trim().replace(/[^\d+]/g, '') : `+91${digits}`;

          await signUp.create({ phoneNumber: finalPhone });
          await signUp.preparePhoneNumberVerification();
          setVerificationPending(true);
        } catch (error: any) {
          console.error(error);
          Alert.alert(t('error'), error.errors?.[0]?.longMessage || 'Failed to send OTP');
        } finally {
          setLoading(false);
        }
      } else {
        // Verify OTP
        const enteredOtp = otpArray.join('');
        if (enteredOtp.length < 6) {
          Alert.alert(t('error'), 'Please enter the 6-digit OTP');
          return;
        }

        if (!isLoaded) return;
        setLoading(true);
        try {
          const completeSignUp = await signUp.attemptPhoneNumberVerification({ code: enteredOtp });
          if (completeSignUp.status === 'complete' || completeSignUp.status === 'missing_requirements') {
            setClerkStatus(completeSignUp.status);
            setPendingSessionId(completeSignUp.createdSessionId || null);
            setStep(2);
            setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 50);
          }
        } catch (error: any) {
          console.error(error);
          Alert.alert(t('error'), error.errors?.[0]?.longMessage || 'Invalid OTP');
        } finally {
          setLoading(false);
        }
      }
    } else {
      if (!formData.name.trim()) {
        Alert.alert(t('error'), 'Please enter your full name');
        return;
      }
      if (!formData.ward.trim()) {
        Alert.alert(t('error'), 'Please enter your ward number');
        return;
      }
      if (formData.interests.length === 0) {
        Alert.alert(t('error'), 'Please select at least one interest');
        return;
      }
      if (formData.isVoter === null) {
        Alert.alert(t('error'), 'Please select whether you are a voter');
        return;
      }

      if (!isLoaded) return;
      setLoading(true);
      try {
        let finalSessionId = null;

        if (clerkStatus === 'missing_requirements') {
          const updatedSignUp = await signUp.update({
            firstName: formData.name,
          });

          if (updatedSignUp.status === 'complete') {
            finalSessionId = updatedSignUp.createdSessionId;
          } else {
            Alert.alert(
              'Clerk Configuration Error',
              `Status: ${updatedSignUp.status}\nMissing: [${updatedSignUp.missingFields?.join(', ')}]\nPlease disable these requirements in the Clerk Dashboard or restart.`
            );
            setLoading(false);
            return;
          }
        } else if (clerkStatus === 'complete') {
          finalSessionId = pendingSessionId;
        }

        if (finalSessionId) {
          await setActive({ session: finalSessionId });

          if (clerkStatus === 'complete' && formData.name) {
            try {
              const currentSession = client.activeSessions.find(s => s.id === finalSessionId) || client.sessions.find(s => s.id === finalSessionId);
              if (currentSession?.user) {
                await currentSession.user.update({ firstName: formData.name });
              }
            } catch (e) {
              console.error('Failed to update Clerk profile name:', e);
            }
          }
        } else {
          Alert.alert('Registration Error', 'Failed to retrieve Clerk Session ID. The signup may have expired.');
          setLoading(false);
          return;
        }

        const user = await authAPI.register(formData);
        setUser(user);
      } catch (error: any) {
        console.error('Registration error:', error);
        if (error.response?.status === 400 || error.message?.includes('400')) {
          try {
            const user = await authAPI.login(formData.phone);
            setUser(user);
          } catch {
            Alert.alert(t('error'), 'Failed to login. Please ensure the backend server is running.');
          }
        } else {
          Alert.alert(t('error'), 'Connection failed. Please check if the backend server is running.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (step === 2) setStep(1);
                else if (verificationPending) setVerificationPending(false);
                else router.back();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={styles.backButtonInner}>
                <Ionicons name="arrow-back" size={20} color="#1E293B" />
              </View>
            </TouchableOpacity>

            {/* Progress */}
            <View style={styles.progressRow}>
              {[1, 2].map((s) => (
                <View key={s} style={styles.progressSegment}>
                  <View
                    style={[
                      styles.progressDot,
                      step >= s && styles.progressDotActive,
                    ]}
                  />
                  {s < 2 && (
                    <View
                      style={[
                        styles.progressLine,
                        step >= 2 && styles.progressLineActive,
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
            <Text style={styles.stepLabel}>Step {step} of 2</Text>
          </View>

          {/* Step 1 – Phone or OTP */}
          {step === 1 && (
            <View style={styles.stepContent}>
              {verificationPending ? (
                <>
                  <View style={styles.iconCircle}>
                    <Ionicons name="shield-checkmark-outline" size={36} color="#2563EB" />
                  </View>
                  <Text style={styles.title}>{t('verifyOtp') || 'Verify OTP'}</Text>
                  <Text style={styles.subtitle}>
                    {t('otpSentTo')?.replace('{phone}', formData.phone.startsWith('+') ? formData.phone : `+91 ${formData.phone}`) || `Enter the 6-digit code sent to ${formData.phone.startsWith('+') ? formData.phone : `+91 ${formData.phone}`}`}
                  </Text>

                  <View style={styles.otpContainer}>
                    {otpArray.map((digit, index) => (
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
                </>
              ) : (
                <>
                  <View style={styles.iconCircle}>
                    <Ionicons name="phone-portrait-outline" size={36} color="#2563EB" />
                  </View>
                  <Text style={styles.title}>{t('enterMobile')}</Text>
                  <Text style={styles.subtitle}>{t('citizenCardNote')}</Text>

                  <FloatingInput
                    label={t('mobileNumber')}
                    value={formData.phone}
                    onChangeText={update('phone')}
                    keyboardType="phone-pad"
                    maxLength={13}
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                    required
                  />
                </>
              )}
            </View>
          )}

          {/* Step 2 – Profile */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={36} color="#2563EB" />
              </View>
              <Text style={styles.title}>{t('completeProfile')}</Text>
              <Text style={styles.subtitle}>{t('personalizeExperience')}</Text>

              <FloatingInput
                ref={nameRef}
                label={t('fullName')}
                value={formData.name}
                onChangeText={update('name')}
                returnKeyType="next"
                onSubmitEditing={() => wardRef.current?.focus()}
                autoComplete="name"
                required
              />

              {/* Age Group Selector */}
              <Text style={styles.interestsLabel}>
                {t('ageGroup')}
              </Text>
              <View style={styles.ageChipsRow}>
                {['Under 18', '18–25', '26–35', '36–45', '46–60', '60+'].map((range) => {
                  const active = formData.age_group === range;
                  return (
                    <TouchableOpacity
                      key={range}
                      style={[styles.ageChip, active && styles.ageChipActive]}
                      onPress={() => setFormData((prev) => ({ ...prev, age_group: range }))}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.ageChipText, active && styles.ageChipTextActive]}>
                        {range}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <FloatingInput
                ref={wardRef}
                label={t('wardNumber')}
                value={formData.ward}
                onChangeText={update('ward')}
                keyboardType="number-pad"
                returnKeyType="done"
                required
              />

              {/* Occupation Selector */}
              <Text style={styles.interestsLabel}>{t('occupation')}</Text>
              <View style={styles.ageChipsRow}>
                {[
                  { id: 'Student', label: t('occStudent') || 'Student' },
                  { id: 'Government Job', label: t('occGovJob') || 'Government Job' },
                  { id: 'Private Job', label: t('occPrivateJob') || 'Private Job' },
                  { id: 'Business', label: t('occBusiness') || 'Business' },
                  { id: 'Farmer', label: t('occFarmer') || 'Farmer' },
                  { id: 'Homemaker', label: t('occHomemaker') || 'Homemaker' },
                  { id: 'Retired', label: t('occRetired') || 'Retired' },
                  { id: 'Other', label: t('other') || 'Other' }
                ].map((occ) => {
                  const active = formData.occupation === occ.id;
                  return (
                    <TouchableOpacity
                      key={occ.id}
                      style={[styles.ageChip, active && styles.ageChipActive]}
                      onPress={() => setFormData((prev) => ({ ...prev, occupation: occ.id }))}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.ageChipText, active && styles.ageChipTextActive]}>
                        {occ.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Gender Selector */}
              <Text style={styles.interestsLabel}>{t('gender')}</Text>
              <View style={styles.ageChipsRow}>
                {[
                  { id: 'Male', label: t('male') },
                  { id: 'Female', label: t('female') },
                  { id: 'Other', label: t('other') }
                ].map((g) => {
                  const active = formData.gender === g.id;
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.ageChip, active && styles.ageChipActive]}
                      onPress={() => setFormData((prev) => ({ ...prev, gender: g.id }))}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.ageChipText, active && styles.ageChipTextActive]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <FloatingInput
                label={t('address')}
                value={formData.address}
                onChangeText={update('address')}
                returnKeyType="next"
              />

              {/* Voter Status Selector */}
              <Text style={styles.interestsLabel}>{t('isVoter')} <Text style={styles.required}>*</Text></Text>
              <View style={styles.ageChipsRow}>
                {[
                  { id: true, label: t('yes') },
                  { id: false, label: t('no') }
                ].map((v) => {
                  const active = formData.isVoter === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id.toString()}
                      style={[styles.ageChip, active && styles.ageChipActive]}
                      onPress={() => setFormData((prev) => ({ ...prev, isVoter: v.id }))}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.ageChipText, active && styles.ageChipTextActive]}>
                        {v.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Interests */}
              <Text style={styles.interestsLabel}>
                {t('selectInterests')} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.chipsGrid}>
                {interestOptions.map((opt) => {
                  const active = formData.interests.includes(opt.id);
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggleInterest(opt.id)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={opt.icon as any}
                        size={18}
                        color={active ? '#fff' : '#64748B'}
                      />
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Consent Checkbox */}
              <View style={styles.consentRowContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, formData.consent && styles.checkboxActive]}
                  onPress={() => setFormData(prev => ({ ...prev, consent: !prev.consent }))}
                  activeOpacity={0.8}
                >
                  {formData.consent && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
                <Text style={styles.consentText}>
                  {t('iAgreeTo')} {' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => setShowTermsModal(true)}
                  >
                    {t('termsAndConditions')}
                  </Text>
                </Text>
              </View>

              {/* Terms and Conditions Modal */}
              <Modal
                visible={showTermsModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTermsModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{t('termsAndConditions')}</Text>
                      <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                        <Ionicons name="close" size={24} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody}>
                      <Text style={styles.termsText}>{t('termsContent')}</Text>
                    </ScrollView>
                    {/* <View style={styles.modalFooter}>
                      <TouchableOpacity
                        style={styles.modalCloseBtn}
                        onPress={() => setShowTermsModal(false)}
                      >
                        <Text style={styles.modalCloseBtnText}>{t('close')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalAcceptBtn}
                        onPress={() => {
                          setFormData(prev => ({ ...prev, consent: true }));
                          setShowTermsModal(false);
                        }}
                      >
                        <Text style={styles.modalAcceptBtnText}>{t('accept')}</Text>
                      </TouchableOpacity>
                    </View> */}
                  </View>
                </View>
              </Modal>
            </View>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.btn, (loading || (step === 2 && !formData.consent)) && styles.btnDisabled]}
            onPress={handleContinue}
            disabled={loading || (step === 2 && !formData.consent)}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={styles.btnText}>{t('pleaseWait')}…</Text>
            ) : (
              <View style={styles.btnInner}>
                <Text style={styles.btnText}>
                  {step === 1 ? t('continue') : t('getStarted')}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 48,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginBottom: 20,
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressSegment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  progressDotActive: {
    backgroundColor: '#2563EB',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#2563EB',
  },
  stepLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 4,
  },

  // Step content
  stepContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
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
    lineHeight: 20,
    marginBottom: 28,
  },

  // Age chips
  ageChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  ageChip: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 100,
  },
  ageChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  ageChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  ageChipTextActive: {
    color: '#FFFFFF',
  },

  // Interests
  interestsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
    marginTop: 4,
  },
  required: {
    color: '#EF4444',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 100,
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // Button
  btn: {
    backgroundColor: '#2563EB',
    marginHorizontal: 24,
    marginTop: 8,
    paddingVertical: 17,
    borderRadius: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.55,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  otpInput: {
    width: 44,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  consentRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
  },
  consentText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  termsLink: {
    color: '#2563EB',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 15, 41, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '80%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  modalBody: {
    padding: 24,
  },
  termsText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalFooter: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalCloseBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  modalAcceptBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalAcceptBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
