import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { issuesAPI } from '../../utils/api';
import { useLanguageStore } from '../../store/languageStore';

export default function ReportIssueScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const [issueForm, setIssueForm] = useState({
    issue_type: '',
    description: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const issueTypes = [
    { id: 'water', label: t('waterSupply'), icon: 'water' },
    { id: 'electricity', label: t('electricity'), icon: 'flash' },
    { id: 'roads', label: t('roads'), icon: 'car' },
    { id: 'garbage', label: t('garbage'), icon: 'trash' },
    { id: 'other', label: t('other'), icon: 'alert-circle' },
  ];

  const handleSubmitIssue = async () => {
    if (!issueForm.issue_type || !issueForm.description || !issueForm.location) {
      Alert.alert(t('error'), t('fillAllFieldsReport'));
      return;
    }

    if (!user) return;

    setSubmitting(true);
    try {
      await issuesAPI.create({
        user_id: user.id,
        issue_type: issueForm.issue_type,
        description: issueForm.description,
        location: issueForm.location,
        ward: user.ward,
      });

      Alert.alert('Success', t('issueReportedSuccess') || 'Issue reported successfully!');
      setIssueForm({ issue_type: '', description: '', location: '' });
      router.back();
    } catch (error) {
      Alert.alert('Error', t('issueReportFailed') || 'Failed to report issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="alert-circle" size={48} color="#fff" />
          <Text style={styles.headerTitle}>{t('reportAnIssue')}</Text>
          <Text style={styles.headerSubtitle}>{t('improveCommunity')}</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.reportContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('issueDetails')}</Text>

            <Text style={styles.label}>{t('issueTypeStar')}</Text>
            <View style={styles.issueTypesGrid}>
              {issueTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.issueTypeChip,
                    issueForm.issue_type === type.id && styles.issueTypeChipActive,
                  ]}
                  onPress={() => setIssueForm({ ...issueForm, issue_type: type.id })}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={issueForm.issue_type === type.id ? '#fff' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.issueTypeText,
                      issueForm.issue_type === type.id && styles.issueTypeTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('descriptionStar')}</Text>
            <TextInput
              style={styles.textArea}
              placeholder={t('describeIssue')}
              value={issueForm.description}
              onChangeText={(text) => setIssueForm({ ...issueForm, description: text })}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>{t('locationStar')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterLocation')}
              value={issueForm.location}
              onChangeText={(text) => setIssueForm({ ...issueForm, location: text })}
            />

            <TouchableOpacity
              style={styles.attachButton}
              onPress={() => Alert.alert('Photo Upload', 'Photo upload feature coming soon!')}
            >
              <Ionicons name="camera" size={20} color="#6B7280" />
              <Text style={styles.attachButtonText}>{t('addPhoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmitIssue}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? t('submitting') : t('submitIssue')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  reportContainer: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  issueTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  issueTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
  },
  issueTypeChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  issueTypeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  issueTypeTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  attachButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
