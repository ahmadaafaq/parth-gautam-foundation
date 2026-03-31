import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../store/languageStore';

const MOCK_INTERACTIONS = (t: any) => [
  { id: 'i1', title: t('inter1Title'), date: `2 ${t('daysAgo')}`, category: t('healthcare'), rating: 0 },
  { id: 'i2', title: t('inter2Title'), date: `5 ${t('daysAgo')}`, category: t('education'), rating: 0 },
];

const MOCK_SURVEYS = (t: any) => [
  { id: 'pg-foundation', title: t('survey1Title'), description: t('survey1Desc'), duration: `3 ${t('mins')}` },
  { id: 'app-usability', title: t('survey2Title'), description: t('survey2Desc'), duration: `2 ${t('mins')}` },
  { id: 'health-feedback', title: t('survey3Title'), description: t('survey3Desc'), duration: `3 ${t('mins')}` },
];

export default function SurveyScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const [refreshing, setRefreshing] = useState(false);
  const [interactions, setInteractions] = useState(MOCK_INTERACTIONS(t));
  const surveys = MOCK_SURVEYS(t);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleRate = (id: string, rating: number) => {
    setInteractions(prev => prev.map(item => item.id === id ? { ...item, rating } : item));
    Alert.alert(t('success'), t('ratingThankYou'));
  };

  const handleTakeSurvey = (id: string) => {
    router.push(`/survey/${id}` as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('surveys')}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.subtitle}>{t('yourFeedbackMatters')}</Text>

          {/* Pending Surveys */}
          <Text style={styles.sectionTitle}>{t('pendingSurveys')}</Text>
          {surveys.map((survey) => (
            <TouchableOpacity 
              key={survey.id} 
              style={styles.surveyCard}
              onPress={() => handleTakeSurvey(survey.id)}
            >
              <View style={styles.surveyIcon}>
                <Ionicons name="clipboard-outline" size={24} color="#3B82F6" />
              </View>
              <View style={styles.surveyContent}>
                <Text style={styles.surveyTitle}>{survey.title}</Text>
                <Text style={styles.surveyDesc}>{survey.description}</Text>
                <Text style={styles.surveyDuration}>
                  <Ionicons name="time-outline" size={12} /> {survey.duration}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}

          {/* Rate Interactions */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('rateInteractions')}</Text>
          {interactions.map((item) => (
            <View key={item.id} style={styles.interactionCard}>
              <View style={styles.interactionHeader}>
                <View style={styles.interactionInfo}>
                  <Text style={styles.interactionTitle}>{item.title}</Text>
                  <Text style={styles.interactionDate}>{item.date} • {item.category}</Text>
                </View>
                <Ionicons 
                  name={item.category === 'Healthcare' ? 'medical' : 'school'} 
                  size={20} 
                  color={item.category === 'Healthcare' ? '#EF4444' : '#F59E0B'} 
                />
              </View>
              <Text style={styles.rateLabel}>{t('rateActivity')}:</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => handleRate(item.id, star)}>
                    <Ionicons 
                      name={star <= item.rating ? "star" : "star-outline"} 
                      size={32} 
                      color={star <= item.rating ? "#F59E0B" : "#D1D5DB"} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  surveyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  surveyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  surveyContent: {
    flex: 1,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  surveyDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  surveyDuration: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  interactionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  interactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  interactionInfo: {
    flex: 1,
  },
  interactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  interactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  rateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
