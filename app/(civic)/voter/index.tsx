import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../../../store/languageStore';
import { IMAGE_LINKS, hasImage } from '../../../utils/constants';

export default function VoterDashboard() {
  const router = useRouter();
  const { t } = useLanguageStore();

  const services = [
    { id: 1, title: t('applyNewVoterId'), subtitle: t('target18Unregistered'), icon: 'person-add', color: '#10B981', route: '/voter/apply' },
    { id: 2, title: t('checkRegStatus'), subtitle: t('notSureIfRegistered'), icon: 'search', color: '#3B82F6', route: '/voter/check' },
    { id: 3, title: t('correctionUpdateDetails'), subtitle: t('fixNameAddress'), icon: 'create', color: '#F59E0B', route: '/voter/correction' },
    { id: 4, title: t('findPollingBooth'), subtitle: t('checkVotingLocation'), icon: 'location', color: '#EF4444', route: '/voter/booth' },
    { id: 5, title: t('trackAppStatus'), subtitle: t('updatesForApplied'), icon: 'analytics', color: '#8B5CF6', route: '/voter/track' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {hasImage('SIDE_IMAGE') ? (
        <ImageBackground
          source={{ uri: IMAGE_LINKS.SIDE_IMAGE }}
          style={styles.header}
          imageStyle={styles.headerImage}
        >
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.3)', 'rgba(37, 100, 235, 0.5)']}
            style={styles.headerOverlay}
          >
            <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkbox" size={36} color="#3B82F6" />
              </View>
              <Text style={styles.headerTitle}>{t('smartVoterTitle')}</Text>
              <Text style={styles.headerSubtitle}>{t('voterServicesPortal')}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={[styles.header, styles.headerOverlay]}
        >
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkbox" size={36} color="#3B82F6" />
            </View>
            <Text style={styles.headerTitle}>{t('smartVoterTitle')}</Text>
            <Text style={styles.headerSubtitle}>{t('voterServicesPortal')}</Text>
          </View>
        </LinearGradient>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('availableServices')}</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => router.push(service.route as any)}
              >
                <View style={[styles.iconContainer, { backgroundColor: service.color + '15' }]}>
                  <Ionicons name={service.icon as any} size={24} color={service.color} />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerImage: {
    resizeMode: 'contain',
    width: '100%',
    left: '35%',
    transform: [{ scaleX: -1 }],
  },
  headerOverlay: {
    paddingBottom: 32,
  },
  backButton: {
    margin: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    minHeight: 150,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
