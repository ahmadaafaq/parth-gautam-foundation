import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { programsAPI } from '../utils/api';
import { useLanguageStore } from '../store/languageStore';

export default function EducationScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const mockPrograms = [
    {
      id: 'ed1',
      title: 'Merit Scholarship 2024',
      description: 'Financial assistance for top-performing students in board exams.',
      location: 'Statewide',
      date: '15th Nov 2024',
      subcategory: 'scholarship',
      seats_available: 500
    },
    {
      id: 'ed2',
      title: 'Digital Literacy Workshop',
      description: 'Learn fundamental computer and internet skills.',
      location: 'Community Center, Ward 2',
      date: 'Next Weekend',
      subcategory: 'skill_training',
      seats_available: 30
    },
    {
      id: 'ed3',
      title: 'Career Counseling Session',
      description: 'One-on-one guidance for high school graduates.',
      location: 'Virtual',
      date: 'Every Saturday',
      subcategory: 'career',
      seats_available: 100
    }
  ];

  const [programs, setPrograms] = useState<any[]>(mockPrograms);
  const [refreshing, setRefreshing] = useState(false);

  // Determine context: scholarship, skills, or general
  const isScholarship = type === 'scholarship';
  const isSkills = type === 'skills';
  const headerIcon = isScholarship ? 'school' : isSkills ? 'construct' : 'school';
  const headerTitle = t('education');
  const headerSubtitle = t('learnGrowSucceed');

  useEffect(() => {
    setPrograms(mockPrograms);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const services = [
    {
      id: 'scholarship',
      title: t('scholarships'),
      description: t('applyForEducationScholarships'),
      icon: 'school',
      color: '#F59E0B',
      route: '/scholarships',
    },
    {
      id: 'skills',
      title: t('skillTraining'),
      description: t('freeSkillDevelopmentCourses'),
      icon: 'construct',
      color: '#10B981',
      route: '/skill-training',
    },
    {
      id: 'career',
      title: t('careerGuidance'),
      description: t('professionalCareerCounseling'),
      icon: 'briefcase',
      color: '#8B5CF6',
      route: '/career-guidance',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name={headerIcon as any} size={48} color="#fff" />
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Services Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('educationServices')}</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => router.push(service.route as any)}
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

        {/* Programs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('availablePrograms')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>

          {programs.length > 0 ? (
            programs.map((program: any) => (
              <TouchableOpacity key={program.id} style={styles.programCard}>
                <View style={styles.programHeader}>
                  <View style={styles.programIconContainer}>
                    <Ionicons
                      name={
                        program.subcategory === 'scholarship'
                          ? 'school'
                          : program.subcategory === 'skill_training'
                            ? 'construct'
                            : 'briefcase'
                      }
                      size={24}
                      color="#F59E0B"
                    />
                  </View>
                  <View style={styles.programInfo}>
                    <Text style={styles.programTitle}>{program.title}</Text>
                    <Text style={styles.programDescription} numberOfLines={2}>
                      {program.description}
                    </Text>
                    <Text style={styles.programLocation} numberOfLines={1}>
                      <Ionicons name="location" size={12} color="#6B7280" /> {program.location}
                    </Text>
                  </View>
                </View>
                {program.date && (
                  <View style={styles.programFooter}>
                    <View style={styles.dateContainer}>
                      <Ionicons name="calendar" size={14} color="#3B82F6" />
                      <Text style={styles.dateText}>{program.date}</Text>
                    </View>
                    {program.seats_available && (
                      <View style={styles.seatsContainer}>
                        <Ionicons name="people" size={14} color="#10B981" />
                        <Text style={styles.seatsText}>{program.seats_available} {t('seats')}</Text>
                      </View>
                    )}
                  </View>
                )}
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => console.log('Application submitted')}
                >
                  <Text style={styles.applyButtonText}>
                    {program.subcategory === 'scholarship' ? t('applyNow') : t('enrollNow')}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>{t('noProgramsAvailable')}</Text>
            </View>
          )}
        </View>

        {/* Career AI Assistant */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.aiCard}
            onPress={() => router.push('/(tabs)/ai')}
          >
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.aiGradient}>
              <View style={styles.aiContent}>
                <Ionicons name="chatbubbles" size={40} color="#fff" />
                <View style={styles.aiText}>
                  <Text style={styles.aiTitle}>{t('aiCareerAssistant')}</Text>
                  <Text style={styles.aiDescription}>
                    {t('personalizedCareerAdvice')}
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    backgroundColor: '#FEF3C7',
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
  programDescription: {
    fontSize: 13,
    color: '#6B7280',
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
  applyButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
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
