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
import { authAPI, seedAPI } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
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
    { id: 'healthcare', label: 'Healthcare', icon: 'medical' },
    { id: 'education', label: 'Education', icon: 'school' },
    { id: 'jobs', label: 'Jobs', icon: 'briefcase' },
    { id: 'volunteer', label: 'Volunteer Work', icon: 'hand-right' },
    { id: 'community', label: 'Community Issues', icon: 'people' },
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
        Alert.alert('Error', 'Please enter a valid mobile number');
        return;
      }
      setStep(2);
    } else {
      if (!formData.name || !formData.ward || formData.interests.length === 0) {
        Alert.alert('Error', 'Please fill all required fields');
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
            Alert.alert('Error', 'Failed to login');
          }
        } else {
          Alert.alert('Error', 'Registration failed. Please try again.');
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
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              <Ionicons name="phone-portrait" size={64} color="#3B82F6" />
              <Text style={styles.title}>Enter Your Mobile Number</Text>
              <Text style={styles.subtitle}>
                We'll use this to create your Citizen Card
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                maxLength={10}
              />
            </View>
          ) : (
            <View style={styles.content}>
              <Ionicons name="person-circle" size={64} color="#3B82F6" />
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>Help us personalize your experience</Text>

              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Age Group (e.g., 18-25)"
                value={formData.age_group}
                onChangeText={(text) => setFormData({ ...formData, age_group: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Ward Number *"
                keyboardType="number-pad"
                value={formData.ward}
                onChangeText={(text) => setFormData({ ...formData, ward: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Occupation"
                value={formData.occupation}
                onChangeText={(text) => setFormData({ ...formData, occupation: text })}
              />

              <Text style={styles.label}>Select Your Interests *</Text>
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
              {loading ? 'Please wait...' : step === 1 ? 'Continue' : 'Get Started'}
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
    alignItems: 'center',
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
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
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
