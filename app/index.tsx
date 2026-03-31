import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguageStore } from '../store/languageStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();

  return (
    <LinearGradient
      colors={['#0284C7', '#1D4ED8', '#312E81']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative background blobs */}
      <View style={styles.blobTopLeft} />
      <View style={styles.blobBottomRight} />

      <SafeAreaView style={styles.safeArea}>
        {/* Language switcher */}
        <View style={styles.header}>
          <LanguageSwitcher />
        </View>

        {/* Hero section */}
        <View style={styles.hero}>
          {/* Circular logo with glowing ring */}
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Image
                source={require('../assets/images/pg-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Welcome badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✦  {t('welcomeTitle').toUpperCase()}  ✦</Text>
          </View>

          {/* App name */}
          <Text style={styles.appName}>{t('welcomeSubtitle')}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.description}>{t('welcomeDescription')}</Text>
        </View>

        {/* Bottom buttons */}
        <View style={styles.footer}>
          {/* Register — solid white */}
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/onboarding')}
          >
            <Ionicons name="person-add-outline" size={20} color="#1D4ED8" style={styles.btnIcon} />
            <Text style={styles.primaryBtnText}>{t('continueWithMobile')}</Text>
          </TouchableOpacity>

          {/* Login — glass */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/login')}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.btnIcon} />
            <Text style={styles.secondaryBtnText}>{t('login')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const LOGO = 120;

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Decorative blobs for depth */
  blobTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  blobBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'flex-end',
  },

  /* ── Hero ── */
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  /* Glowing ring around logo */
  logoOuter: {
    width: LOGO + 24,
    height: LOGO + 24,
    borderRadius: (LOGO + 24) / 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  logoInner: {
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: LOGO * 0.7,
    height: LOGO * 0.7,
  },

  /* Pill badge "WELCOME TO" */
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2.5,
  },

  /* App name */
  appName: {
    fontSize: 28, // Slightly reduced to fit better
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 20,
    width: '100%',
  },

  /* Divider */
  divider: {
    width: 56,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginBottom: 20,
  },

  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 26,
    width: '100%',
  },

  /* ── Footer ── */
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    gap: 12,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 17,
    borderRadius: 16,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D4ED8',
    textAlign: 'center',
    flex: 1,
  },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 17,
    borderRadius: 16,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },

  btnIcon: {
    position: 'absolute',
    left: 20,
  },
});
