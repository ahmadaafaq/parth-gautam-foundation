import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { healthCampsAPI, healthCampRegistrationsAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { HealthCamp } from './index';

export default function HealthCampDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const router = useRouter();
  const [program, setProgram] = useState<HealthCamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    loadProgram();
    if (user && id) {
      checkRegistrationStatus();
    }
  }, [id, user]);

  const mockHealthCamps = [
    {
      id: 'hc1',
      title: 'Free Mega Health Camp',
      description: 'Comprehensive health checkup including blood tests, eye exam, and general physician consultation.',
      category: 'General',
      subcategory: 'Checkup',
      location: 'Community Hall, Ward 1',
      ward: 'Ward 1',
      date: new Date(Date.now() + 86400000 * 2).toISOString(),
      seats_available: 50,
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      created_at: new Date().toISOString(),
      is_active: true,
      registrations_count: 120,
      tags: ['Free', 'Checkup'],
      contact_info: '9876543210',
      latitude: 0,
      longitude: 0,
    },
    {
      id: 'hc2',
      title: 'Eye Checkup Drive',
      description: 'Free eye checkup and distribution of spectacles.',
      category: 'Specialized',
      subcategory: 'Eye',
      location: 'City Hospital',
      ward: 'Ward 3',
      date: new Date(Date.now() + 86400000 * 5).toISOString(),
      seats_available: 100,
      image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=800&q=80',
      created_at: new Date().toISOString(),
      is_active: true,
      registrations_count: 45,
      tags: ['Eye', 'Free'],
      contact_info: '9876543211',
      latitude: 0,
      longitude: 0,
    }
  ];

  const checkRegistrationStatus = async () => {
    try {
      setRegistered(false);
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  const loadProgram = async () => {
    try {
      const data = mockHealthCamps.find(c => c.id === id) || mockHealthCamps[0];
      setProgram(data as HealthCamp);
    } catch (error) {
      console.error('Error loading health camp details:', error);
      Alert.alert('Error', 'Failed to load camp details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!program) return;
    try {
      await Share.share({
        message: `Join the ${program.title} Health Camp at ${program.location} on ${new Date(program.date || Date.now()).toLocaleDateString()}. Download the app to register!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async () => {
    if (!user || !id) {
      Alert.alert('Error', 'Please log in to register for health camps.');
      return;
    }

    setRegistering(true);
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRegistered(true);
      if (program) {
        setProgram({
          ...program,
          registrations_count: (program.registrations_count || 0) + 1,
          seats_available: program.seats_available > 0 ? program.seats_available - 1 : 0
        });
      }
      Alert.alert('Success', 'You have successfully registered for this health camp! We will send you a reminder before the event.');
      setRegistering(false);
    }, 1000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!program) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>{t('campNotFound')}</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>{t('goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner Section */}
        <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: program.image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80' }}
            style={styles.headerImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.headerGradient}
          >
            <SafeAreaView edges={['top']} style={styles.topActionsRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                <Ionicons name="share-social" size={24} color="#fff" />
              </TouchableOpacity>
            </SafeAreaView>

            <View style={styles.headerBottomContent}>
              <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{program.category || t('healthCamps')}</Text>
                </View>
                {program.subcategory && (
                  <View style={[styles.categoryBadge, styles.subCategoryBadge]}>
                    <Text style={styles.categoryBadgeText}>{program.subcategory}</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.title}>{program.title}</Text>

          <View style={styles.statsRow}>
            {program.registrations_count > 0 && (
              <View style={styles.statBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.statText}>{program.registrations_count} {t('registered')}</Text>
              </View>
            )}
            {program.seats_available !== undefined && program.seats_available !== null && (
              <View style={[styles.statBadge, styles.seatsBadge]}>
                <Ionicons name="people" size={16} color="#F59E0B" />
                <Text style={styles.seatsText}>{program.seats_available} {t('seatsLeft')}</Text>
              </View>
            )}
          </View>

          {/* Quick Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIconBox, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="calendar-outline" size={22} color="#4F46E5" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{t('date')}</Text>
                <Text style={styles.infoValue}>{new Date(program.date || Date.now()).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="location-outline" size={22} color="#EF4444" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{t('location')}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{program.location}</Text>
                {program.ward && <Text style={styles.infoSubValue}>{t('ward')}: {program.ward}</Text>}
              </View>
            </View>

            {program.contact_info && (
              <View style={styles.infoItem}>
                <View style={[styles.infoIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="call-outline" size={22} color="#10B981" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>{t('contactOrganizer')}</Text>
                  <Text style={styles.infoValue}>{program.contact_info}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Tags */}
          {program.tags && program.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {program.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* About Section */}
          <Text style={styles.sectionTitle}>{t('aboutThisCamp')}</Text>
          <Text style={styles.descriptionText}>
            {program.description || '...'}
          </Text>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={styles.bottomBar}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.9)', '#ffffff']}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView edges={['bottom']}>
          <TouchableOpacity
            style={[
              styles.registerButton,
              (registered || program.seats_available === 0) && styles.registerButtonDisabled
            ]}
            onPress={handleRegister}
            disabled={registering || registered || program.seats_available === 0}
          >
            {registering ? (
              <ActivityIndicator color="#fff" />
            ) : registered ? (
              <View style={styles.buttonRow}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.registerButtonText}>{t('registeredSuccessfully')}</Text>
              </View>
            ) : program.seats_available === 0 ? (
              <Text style={styles.registerButtonText}>{t('campFull')}</Text>
            ) : (
              <Text style={styles.registerButtonText}>{t('registerNow')}</Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  headerImageContainer: {
    height: 320,
    width: '100%',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  headerBottomContent: {
    padding: 20,
    paddingBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subCategoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 34,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  seatsBadge: {
    backgroundColor: '#FEF3C7',
  },
  seatsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  infoGrid: {
    gap: 20,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  infoSubValue: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 26,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  registerButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
