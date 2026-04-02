import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../store/languageStore';

export default function HealthSummaryScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          `${t('healthSummaryReport')}\n\n${t('healthScoreLabel')}: 78/100\n${t('status')}: ${t('healthStatusGood')}`,
        title: t('healthSummaryReport'),
      });
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      Alert.alert(t('error'), t('failedToShare'));
    }
  };

  const keyFindings = [
    { label: t('bloodPressure'), value: t('bpNormal') },
    { label: t('cholesterolLevel'), value: t('cholesterolElevated') },
    { label: t('bloodSugar'), value: t('sugarNormal') },
  ];

  const deficiencies = [
    { label: t('vitaminD'), value: t('vitDLow') },
    { label: t('ironLevel'), value: t('ironLow') },
  ];

  const lifestyle = [
    t('lifestyleTip1'),
    t('lifestyleTip2'),
    t('lifestyleTip3'),
    t('lifestyleTip4'),
  ];

  const tests = [
    t('testCBC'),
    t('testLipid'),
    t('testThyroid'),
    t('testHbA1c'),
    t('testVitamins'),
    t('testKidney')
  ];

  const summaryCards = [
    {
      id: 'appointments',
      title: t('appointmentsCard'),
      description: t('appointmentsDesc'),
      icon: 'calendar',
      color: '#3B82F6',
    },
    {
      id: 'prescription',
      title: t('prescriptionCard'),
      description: t('prescriptionDesc'),
      icon: 'medical',
      color: '#10B981',
    },
    {
      id: 'imaging',
      title: t('imagingCard'),
      description: t('imagingDesc'),
      icon: 'images',
      color: '#F59E0B',
    },
    {
      id: 'reports',
      title: t('reportsCard'),
      description: t('reportsDesc'),
      icon: 'document-text',
      color: '#8B5CF6',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="heart" size={48} color="#fff" />
          <Text style={styles.headerTitle}>{t('healthSummary')}</Text>
          <Text style={styles.headerSubtitle}>{t('aiHealthAnalysis')}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Summary Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('medicalRecords')}</Text>
            <View style={styles.servicesGrid}>
              {summaryCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={styles.serviceCard}
                  onPress={() => {
                    if (card.id === 'appointments') {
                      router.push('/appointments' as any);
                    } else if (card.id === 'imaging') {
                      router.push('/imaging' as any);
                    } else if (card.id === 'reports') {
                      router.push('/medical-records' as any);
                    } else if (card.id === 'prescription') {
                      router.push('/prescriptions' as any);
                    } else {
                      Alert.alert(card.title, t('featureAvailableSoon'));
                    }
                  }}
                >
                  <View style={[styles.serviceIcon, { backgroundColor: card.color + '20' }]}>
                    <Ionicons name={card.icon as any} size={28} color={card.color} />
                  </View>
                  <Text style={styles.serviceTitle}>{card.title}</Text>
                  <Text style={styles.serviceDescription}>{card.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI Loading */}
          {isGenerating && (
            <View style={[styles.card, styles.loadingCard]}>
              <ActivityIndicator size="small" color="#EF4444" />
              <Text style={styles.loadingText}>{t('processingReportAI')}</Text>
            </View>
          )}

          {/* Health Score */}
          <LinearGradient
            colors={['#F0FDF4', '#DCFCE7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <Text style={styles.scoreLabel}>{t('overallHealthScore')}</Text>
            <Text style={styles.scoreValue}>78/100</Text>
            <Text style={styles.scoreStatus}>{t('healthStatusGood')}</Text>
          </LinearGradient>

          {/* Key Findings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart" size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>{t('keyFindings')}</Text>
            </View>
            {keyFindings.map((item, idx) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardSubtitle}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Potential Deficiencies */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={20} color="#F97316" />
              <Text style={styles.sectionTitle}>{t('potentialDeficiencies')}</Text>
            </View>
            {deficiencies.map((item, idx) => (
              <View key={idx} style={[styles.card, styles.warningCard]}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardSubtitle}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Lifestyle & Diet */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="leaf" size={20} color="#16A34A" />
              <Text style={styles.sectionTitle}>{t('lifestyleAndDiet')}</Text>
            </View>
            {lifestyle.map((tip, idx) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.bulletText}>• {tip}</Text>
              </View>
            ))}
          </View>

          {/* Recommended Tests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('recommendedMonthlyTests')}</Text>
            <View style={styles.testsGrid}>
              {tests.map((test, idx) => (
                <View key={idx} style={styles.testChip}>
                  <Text style={styles.testChipText}>{test}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleRegenerate}
              disabled={isGenerating}
              style={[styles.primaryButton, isGenerating && styles.buttonDisabled]}
            >
              <LinearGradient
                colors={isGenerating ? ['#D1D5DB', '#D1D5DB'] : ['#EF4444', '#DC2626']}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>{t('regenerateReport')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Alert.alert(t('downloadReport'), t('pdfDownloadSoon'))}
            >
              <Ionicons name="download-outline" size={18} color="#EF4444" />
              <Text style={styles.secondaryButtonText}>{t('downloadReport')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color="#EF4444" />
              <Text style={styles.secondaryButtonText}>{t('shareReport')}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
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

  // Header
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },

  scrollView: { flex: 1 },
  content: { padding: 16 },

  // Loading
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },

  // Score
  scoreCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 8,
  },
  scoreStatus: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Section
  section: { marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    marginTop: 8,
  },

  // Services Grid
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

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  warningCard: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBF7',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  bulletText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },

  // Tests
  testsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  testChip: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  testChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Buttons
  actions: { gap: 12, marginTop: 8 },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
