import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { t } = useLanguageStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  return (
    <LinearGradient
      colors={['#0EA5E9', '#3B82F6', '#6366F1']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="people-circle" size={120} color="#fff" />
        </View>
        
        <Text style={styles.title}>{t('welcomeTitle')}</Text>
        <Text style={styles.subtitle}>{t('welcomeSubtitle')}</Text>
        <Text style={styles.description}>{t('welcomeDescription')}</Text>

        <View style={styles.pillarsContainer}>
          <View style={styles.pillar}>
            <Ionicons name="medical" size={24} color="#fff" />
            <Text style={styles.pillarText}>{t('healthcare')}</Text>
          </View>
          <View style={styles.pillar}>
            <Ionicons name="school" size={24} color="#fff" />
            <Text style={styles.pillarText}>{t('education')}</Text>
          </View>
          <View style={styles.pillar}>
            <Ionicons name="people" size={24} color="#fff" />
            <Text style={styles.pillarText}>{t('community')}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding')}
        >
          <Ionicons name="phone-portrait" size={24} color="#3B82F6" />
          <Text style={styles.buttonText}>{t('continueWithMobile')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.whatsappButton]}
          onPress={() => router.push('/onboarding')}
        >
          <Ionicons name="logo-whatsapp" size={24} color="#fff" />
          <Text style={[styles.buttonText, styles.whatsappButtonText]}>
            {t('continueWithWhatsApp')}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#E0F2FE',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  pillarsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 48,
  },
  pillar: {
    alignItems: 'center',
    gap: 8,
  },
  pillarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    flex: 1,
    textAlign: 'center',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  whatsappButtonText: {
    color: '#fff',
  },
});
