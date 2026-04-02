import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  Linking,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { programsAPI } from '../utils/api';
import { useLanguageStore } from '../store/languageStore';
import * as DocumentPicker from 'expo-document-picker';
import healthcareBanner from '../assets/images/parth-side.png';

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
  const [isAidModalVisible, setIsAidModalVisible] = useState(false);
  const [aidForm, setAidForm] = useState({
    studentName: '',
    parentName: '',
    institutionName: '',
    currentClass: '',
    annualIncome: '',
    purpose: '',
    contact: '',
    rationCardImage: null as DocumentPicker.DocumentPickerAsset | null,
  });

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

  const handleApplyAid = () => {
    setIsAidModalVisible(true);
  };

  const submitAidApplication = () => {
    if (!aidForm.studentName || !aidForm.contact || !aidForm.institutionName || !aidForm.rationCardImage) {
      if (!aidForm.rationCardImage) {
        Alert.alert(t('error'), t('rationCardRequired'));
      } else {
        Alert.alert(t('error'), t('fillAllFieldsReport'));
      }
      return;
    }

    Alert.alert(
      t('success'),
      t('educationAidSuccessMsg'),
      [{
        text: t('ok'),
        onPress: () => {
          setIsAidModalVisible(false);
          setAidForm({
            studentName: '',
            parentName: '',
            institutionName: '',
            currentClass: '',
            annualIncome: '',
            purpose: '',
            contact: '',
            rationCardImage: null,
          });
        }
      }]
    );
  };

  const handlePickRationCard = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        multiple: false,
      });

      if (!result.canceled) {
        setAidForm({ ...aidForm, rationCardImage: result.assets[0] });
      }
    } catch (err) {
      console.error('Pick error:', err);
    }
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
      url: 'https://ai-lms-zeta-nine.vercel.app',
    },
    {
      id: 'career',
      title: t('careerGuidance'),
      description: t('professionalCareerCounseling'),
      icon: 'briefcase',
      color: '#8B5CF6',
      url: 'https://v0-ai-career-guidance-platform-ten.vercel.app/',
    },
    {
      id: 'ai-tutor',
      title: t('aiTutor'),
      description: t('aiTutorDesc'),
      icon: 'hardware-chip',
      color: '#EC4899',
      url: 'https://school-ai-ten.vercel.app/',
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
          colors={['rgba(245, 158, 11, 0.35)', 'rgba(217, 119, 6, 0.5)']}
          style={styles.headerOverlay}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name={headerIcon as any} size={48} color="#fff" />
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
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
          <Text style={styles.sectionTitle}>{t('educationServices')}</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => {
                  if ('url' in service && service.url) {
                    Linking.openURL(service.url);
                  } else if ('route' in service && service.route) {
                    router.push(service.route as any);
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

          {/* Education Aid Call to Action */}
          <TouchableOpacity
            style={styles.aidButton}
            onPress={handleApplyAid}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.aidButtonGradient}
            >
              <Ionicons name="sparkles" size={24} color="#fff" />
              <Text style={styles.aidButtonText}>{t('applyForEducationAid')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
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

      <Modal
        visible={isAidModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAidModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('applyForEducationAidTitle')}</Text>
              <TouchableOpacity onPress={() => setIsAidModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.formContent}>
              <Text style={styles.inputLabel}>{t('studentName')} *</Text>
              <TextInput
                style={styles.input}
                value={aidForm.studentName}
                onChangeText={(text) => setAidForm({ ...aidForm, studentName: text })}
                placeholder={t('studentName')}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>{t('parentName')}</Text>
              <TextInput
                style={styles.input}
                value={aidForm.parentName}
                onChangeText={(text) => setAidForm({ ...aidForm, parentName: text })}
                placeholder={t('parentName')}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>{t('institutionName')} *</Text>
              <TextInput
                style={styles.input}
                value={aidForm.institutionName}
                onChangeText={(text) => setAidForm({ ...aidForm, institutionName: text })}
                placeholder={t('institutionName')}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>{t('currentClass')}</Text>
              <TextInput
                style={styles.input}
                value={aidForm.currentClass}
                onChangeText={(text) => setAidForm({ ...aidForm, currentClass: text })}
                placeholder={t('currentClass')}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>{t('annualIncome')}</Text>
              <TextInput
                style={styles.input}
                value={aidForm.annualIncome}
                onChangeText={(text) => setAidForm({ ...aidForm, annualIncome: text })}
                placeholder={t('annualIncome')}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>{t('contactNumber')} *</Text>
              <TextInput
                style={styles.input}
                value={aidForm.contact}
                onChangeText={(text) => setAidForm({ ...aidForm, contact: text })}
                placeholder={t('contactNumber')}
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>{t('purposeOfAid')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={aidForm.purpose}
                onChangeText={(text) => setAidForm({ ...aidForm, purpose: text })}
                placeholder={t('purposeOfAid')}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>{t('rationCard')} *</Text>
              <View style={styles.uploadSection}>
                {aidForm.rationCardImage && (
                  <View style={styles.fileRow}>
                    <View style={styles.fileInfo}>
                      <Ionicons
                        name={aidForm.rationCardImage.mimeType?.includes('pdf') ? 'document-text' : 'image'}
                        size={20}
                        color="#6B7280"
                      />
                      <Text style={styles.fileName} numberOfLines={1}>
                        {aidForm.rationCardImage.name}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setAidForm({ ...aidForm, rationCardImage: null })}>
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity style={styles.addDocBtn} onPress={handlePickRationCard}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#F59E0B" />
                  <Text style={styles.addDocBtnText}>{t('uploadRationCard')}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.applyButton, { marginTop: 24, paddingVertical: 14 }]} onPress={submitAidApplication}>
                <Text style={styles.applyButtonText}>{t('applyNow')}</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#F59E0B',
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
    marginBottom: 20,
  },
  aidButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  aidButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  aidButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '80%',
    maxHeight: '90%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  formContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  uploadSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  addDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  addDocBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
});
