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
import { useAuthStore } from '../store/authStore';
import { issuesAPI } from '../utils/api';

export default function CommunityScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('volunteer'); // volunteer, report, events
  const [issueForm, setIssueForm] = useState({
    issue_type: '',
    description: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const issueTypes = [
    { id: 'water', label: 'Water Supply', icon: 'water' },
    { id: 'electricity', label: 'Electricity', icon: 'flash' },
    { id: 'roads', label: 'Roads', icon: 'car' },
    { id: 'garbage', label: 'Garbage', icon: 'trash' },
    { id: 'other', label: 'Other', icon: 'alert-circle' },
  ];

  const handleSubmitIssue = async () => {
    if (!issueForm.issue_type || !issueForm.description || !issueForm.location) {
      Alert.alert('Error', 'Please fill all fields');
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

      Alert.alert('Success', 'Issue reported successfully!');
      setIssueForm({ issue_type: '', description: '', location: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to report issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const volunteerPrograms = [
    {
      id: 1,
      title: 'Community Cleanup Drive',
      date: 'This Sunday 7 AM',
      location: 'City Park',
      volunteers: 30,
      icon: 'leaf',
      color: '#10B981',
    },
    {
      id: 2,
      title: 'Food Distribution',
      date: 'Every Saturday',
      location: 'Ward 12 Center',
      volunteers: 25,
      icon: 'restaurant',
      color: '#F59E0B',
    },
    {
      id: 3,
      title: 'Tree Plantation Drive',
      date: 'Next Month',
      location: 'Multiple Locations',
      volunteers: 50,
      icon: 'flower',
      color: '#10B981',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="people" size={48} color="#fff" />
          <Text style={styles.headerTitle}>Community Impact</Text>
          <Text style={styles.headerSubtitle}>Make a difference together</Text>
        </View>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'volunteer' && styles.tabActive]}
          onPress={() => setActiveTab('volunteer')}
        >
          <Text style={[styles.tabText, activeTab === 'volunteer' && styles.tabTextActive]}>
            Volunteer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'report' && styles.tabActive]}
          onPress={() => setActiveTab('report')}
        >
          <Text style={[styles.tabText, activeTab === 'report' && styles.tabTextActive]}>
            Report Issue
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.tabActive]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
            Events
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'volunteer' && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Volunteer Opportunities</Text>
            {volunteerPrograms.map((program) => (
              <TouchableOpacity key={program.id} style={styles.programCard}>
                <View style={[styles.programIcon, { backgroundColor: program.color + '20' }]}>
                  <Ionicons name={program.icon as any} size={24} color={program.color} />
                </View>
                <View style={styles.programDetails}>
                  <Text style={styles.programTitle}>{program.title}</Text>
                  <View style={styles.programMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar" size={12} color="#6B7280" />
                      <Text style={styles.metaText}>{program.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="location" size={12} color="#6B7280" />
                      <Text style={styles.metaText}>{program.location}</Text>
                    </View>
                  </View>
                  <View style={styles.volunteersInfo}>
                    <Ionicons name="people" size={16} color="#8B5CF6" />
                    <Text style={styles.volunteersText}>
                      {program.volunteers} volunteers needed
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => Alert.alert('Success', 'You have joined this program!')}
                >
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {activeTab === 'report' && (
        <KeyboardAvoidingView
          style={styles.reportContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Report a Community Issue</Text>
              
              <Text style={styles.label}>Issue Type *</Text>
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

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the issue in detail..."
                value={issueForm.description}
                onChangeText={(text) => setIssueForm({ ...issueForm, description: text })}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter location or landmark"
                value={issueForm.location}
                onChangeText={(text) => setIssueForm({ ...issueForm, location: text })}
              />

              <TouchableOpacity
                style={styles.attachButton}
                onPress={() => Alert.alert('Photo Upload', 'Photo upload feature coming soon!')}
              >
                <Ionicons name="camera" size={20} color="#6B7280" />
                <Text style={styles.attachButtonText}>Add Photo (Optional)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitIssue}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Report Issue'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {activeTab === 'events' && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Community Events</Text>
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No upcoming events</Text>
              <Text style={styles.emptySubtext}>Check back later for new events</Text>
            </View>
          </View>
        </ScrollView>
      )}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#3B82F6',
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
  programCard: {
    flexDirection: 'row',
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
  programIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  programDetails: {
    flex: 1,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  programMeta: {
    gap: 4,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  volunteersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDE9FE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  volunteersText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  joinButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
