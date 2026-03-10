import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { authAPI, seedAPI } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const { t } = useLanguageStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    age_group: '',
    ward: '',
    occupation: '',
    interests: [] as string[],
  });

  const interestOptions = [
    { id: 'healthcare', label: t('healthcare'), icon: 'medical' },
    { id: 'education', label: t('education'), icon: 'school' },
    { id: 'jobs', label: t('jobs'), icon: 'briefcase' },
    { id: 'volunteer', label: t('volunteer'), icon: 'hand-right' },
    { id: 'community', label: t('communityIssues'), icon: 'people' },
  ];

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!formData.phone || formData.phone.length < 10) {
        Alert.alert(t('error'), 'Please enter a valid mobile number');
        return;
      }
      setStep(2);
    } else {
      if (!formData.name || !formData.ward || formData.interests.length === 0) {
        Alert.alert(t('error'), 'Please fill all required fields');
        return;
      }

      setLoading(true);
      try {
        // Seed database first (only once)
        await seedAPI.seedDatabase().catch(() => {});

        // Register user
        const user = await authAPI.register(formData);
        setUser(user);
        router.replace('/(tabs)');
      } catch (error: any) {
        if (error.response?.status === 400) {
          // User exists, try login
          try {
            const user = await authAPI.login(formData.phone);
            setUser(user);
            router.replace('/(tabs)');
          } catch (loginError) {
            Alert.alert(t('error'), 'Failed to login');
          }
        } else {
          Alert.alert(t('error'), 'Registration failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            {step === 2 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(1)}
              >
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
              </TouchableOpacity>
            )}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, step >= 1 && styles.progressBarActive]} />
              <View style={[styles.progressBar, step >= 2 && styles.progressBarActive]} />
            </View>
          </View>

          {step === 1 ? (
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Ionicons name="phone-portrait" size={64} color="#3B82F6" />
              </View>
              <Text style={styles.title}>{t('enterMobile')}</Text>
              <Text style={styles.subtitle}>
                {t('citizenCardNote')}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('mobileNumber')} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('mobileNumber')}
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  maxLength={10}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-circle" size={64} color="#3B82F6" />
              </View>
              <Text style={styles.title}>{t('completeProfile')}</Text>
              <Text style={styles.subtitle}>{t('personalizeExperience')}</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('fullName')} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('fullName')}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, name: text }));
                  }}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoComplete="off"
                  textContentType="none"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  autoCorrect={false}
                  spellCheck={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('ageGroup')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('ageGroup')}
                  value={formData.age_group}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, age_group: text }));
                  }}
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('wardNumber')} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('wardNumber')}
                  keyboardType="number-pad"
                  value={formData.ward}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, ward: text }));
                  }}
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('occupation')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('occupation')}
                  value={formData.occupation}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, occupation: text }));
                  }}
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="done"
                />
              </View>

              <Text style={styles.label}>{t('selectInterests')} *</Text>
              <View style={styles.interestsContainer}>
                {interestOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.interestChip,
                      formData.interests.includes(option.id) && styles.interestChipActive,
                    ]}
                    onPress={() => toggleInterest(option.id)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={formData.interests.includes(option.id) ? '#fff' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.interestText,
                        formData.interests.includes(option.id) && styles.interestTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('pleaseWait') : step === 1 ? t('continue') : t('getStarted')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#3B82F6',
  },
  content: {
    padding: 24,
    alignItems: 'stretch',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 4,
  },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    alignSelf: 'flex-start',
    width: '100%',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
  },
  interestChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  interestText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  interestTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
