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

export default function HealthSummaryScreen() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          'Health Summary Report\n\nHealth Score: 78/100\nStatus: Good - Maintain current health habits',
        title: 'My Health Summary',
      });
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const keyFindings = [
    { label: 'Blood Pressure', value: '120/80 mmHg - Normal range' },
    { label: 'Cholesterol Level', value: '180 mg/dL - Slightly elevated' },
    { label: 'Blood Sugar', value: '95 mg/dL - Normal fasting level' },
  ];

  const deficiencies = [
    { label: 'Vitamin D', value: 'Below optimal levels - Increase sunlight exposure' },
    { label: 'Iron Level', value: 'Borderline low - Include iron-rich foods in diet' },
  ];

  const lifestyle = [
    'Increase intake of green vegetables and whole grains',
    'Exercise 30 minutes daily for cardiovascular health',
    'Reduce sodium intake to maintain blood pressure',
    'Get 7-8 hours of quality sleep every night',
  ];

  const tests = ['CBC', 'Lipid Panel', 'Thyroid', 'HbA1c', 'Vitamins', 'Kidney Panel'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="heart" size={48} color="#fff" />
          <Text style={styles.headerTitle}>Health Summary</Text>
          <Text style={styles.headerSubtitle}>AI-powered health analysis & insights</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* AI Loading */}
          {isGenerating && (
            <View style={[styles.card, styles.loadingCard]}>
              <ActivityIndicator size="small" color="#EF4444" />
              <Text style={styles.loadingText}>Processing your report with AI...</Text>
            </View>
          )}

          {/* Health Score */}
          <LinearGradient
            colors={['#F0FDF4', '#DCFCE7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <Text style={styles.scoreLabel}>Overall Health Score</Text>
            <Text style={styles.scoreValue}>78/100</Text>
            <Text style={styles.scoreStatus}>Good — Maintain current health habits</Text>
          </LinearGradient>

          {/* Key Findings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart" size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Key Findings</Text>
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
              <Text style={styles.sectionTitle}>Potential Deficiencies</Text>
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
              <Text style={styles.sectionTitle}>Lifestyle & Diet</Text>
            </View>
            {lifestyle.map((tip, idx) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.bulletText}>• {tip}</Text>
              </View>
            ))}
          </View>

          {/* Recommended Tests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Monthly Tests</Text>
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
                <Text style={styles.primaryButtonText}>Regenerate Report</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Alert.alert('Download', 'PDF download coming soon!')}
            >
              <Ionicons name="download-outline" size={18} color="#EF4444" />
              <Text style={styles.secondaryButtonText}>Download Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color="#EF4444" />
              <Text style={styles.secondaryButtonText}>Share Report</Text>
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
