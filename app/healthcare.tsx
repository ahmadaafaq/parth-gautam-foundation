import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { healthCampsAPI } from '../utils/api';
import { useLanguageStore } from '../store/languageStore';
import healthcareBanner from '../assets/images/parth-side.png';

export default function HealthcareScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const [programs, setPrograms] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUpcomingCamps = async () => {
    try {
      const data = await healthCampsAPI.getAll();
      setPrograms((data || []).slice(0, 3));
    } catch (error) {
      console.error('Error fetching health camps:', error);
    }
  };

  useEffect(() => {
    fetchUpcomingCamps();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUpcomingCamps();
    setRefreshing(false);
  };

  const services = [
    {
      id: 'doctor',
      title: t('bookAppointmentEx'),
      description: t('scheduleAppointments'),
      icon: 'medical',
      color: '#EF4444',
    },
    {
      id: 'camp',
      title: t('healthCamps'),
      description: t('freeHealthCheckups'),
      icon: 'fitness',
      color: '#F59E0B',
    },
    {
      id: 'telehealth',
      title: t('teleconsultation'),
      description: t('onlineConsultations'),
      icon: 'videocam',
      color: '#10B981',
    },
    {
      id: 'advice',
      title: t('healthSummary'),
      description: t('aiHealthSummary'),
      icon: 'heart',
      color: '#8B5CF6',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ImageBackground
        source={healthcareBanner}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.35)', 'rgba(220, 38, 38, 0.5)']}
          style={styles.headerOverlay}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="medical" size={48} color="#fff" />
            <Text style={styles.headerTitle}>{t('smartHealthcare')}</Text>
            <Text style={styles.headerSubtitle}>{t('accessHealthcare')}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Services Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('healthcareServices')}</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => {
                  if (service.id === 'camp') {
                    router.push('/health-camps');
                  } else if (service.id === 'doctor') {
                    router.push('/book-appointment');
                  } else if (service.id === 'telehealth') {
                    router.push('/teleconsultation');
                  } else if (service.id === 'advice') {
                    router.push('/health-summary');
                  } else {
                    Alert.alert(service.title, t('featureAvailableSoon'));
                  }
                }}
              >
                <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
                  <Ionicons name={service.icon as any} size={28} color={service.color} />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Camps */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('upcomingHealthCamps')}</Text>
            <TouchableOpacity onPress={() => router.push('/health-camps')}>
              <Text style={styles.seeAllText}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>

          {programs.length > 0 ? (
            programs.map((program: any) => (
              <TouchableOpacity
                key={program.id}
                style={styles.programCard}
                onPress={() => router.push(`/health-camps/${program.id}`)}
              >
                <View style={styles.programHeader}>
                  <View style={styles.programIconContainer}>
                    <Ionicons name="medical" size={24} color="#EF4444" />
                  </View>
                  <View style={styles.programInfo}>
                    <Text style={styles.programTitle}>{program.title}</Text>
                    <Text style={styles.programLocation} numberOfLines={1}>
                      <Ionicons name="location" size={12} color="#6B7280" /> {program.location}
                    </Text>
                  </View>
                </View>
                {program.date && (
                  <View style={styles.programFooter}>
                    <View style={styles.dateContainer}>
                      <Ionicons name="calendar" size={14} color="#3B82F6" />
                      <Text style={styles.dateText}>{new Date(program.date).toLocaleDateString()}</Text>
                    </View>
                    {program.seats_available !== null && program.seats_available !== undefined && (
                      <View style={styles.seatsContainer}>
                        <Ionicons name="people" size={14} color="#10B981" />
                        <Text style={styles.seatsText}>{program.seats_available} {t('seats')}</Text>
                      </View>
                    )}
                  </View>
                )}
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => router.push(`/health-camps/${program.id}`)}
                >
                  <Text style={styles.registerButtonText}>{t('viewDetails')}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>{t('noUpcomingCamps')}</Text>
            </View>
          )}
        </View>

        {/* Health AI Assistant */}
        {/* <View style={styles.section}>
          <TouchableOpacity
            style={styles.aiCard}
            onPress={() => router.push('/(tabs)/ai')}
          >
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.aiGradient}>
              <View style={styles.aiContent}>
                <Ionicons name="chatbubbles" size={40} color="#fff" />
                <View style={styles.aiText}>
                  <Text style={styles.aiTitle}>Ask Health AI</Text>
                  <Text style={styles.aiDescription}>
                    Get instant health advice and guidance
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View> */}

        <View style={{ height: 24 }} />
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
    backgroundColor: '#EF4444',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerImage: {
    resizeMode: 'contain',
    width: '100%',
    left: '-35%',
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
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
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  programCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  programHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  programIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  programLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  programFooter: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  seatsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  registerButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  aiCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  aiText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  aiDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
