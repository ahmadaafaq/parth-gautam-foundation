import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../../store/languageStore';

export default function CommunityTabScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState('volunteer'); // volunteer, events

  const volunteerPrograms = [
    {
      id: 1,
      title: 'Community Cleanup Drive',
      date: 'This Sunday, 7:00 AM',
      location: 'City Park',
      volunteers: 30,
      icon: 'leaf',
      color: '#10B981',
    },
    {
      id: 2,
      title: 'Food Distribution',
      date: 'Every Saturday, 12:00 PM',
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

  const mockEvents = [
    {
      id: 1,
      title: 'Town Hall Meeting',
      date: 'Oct 25, 2024 5:00 PM',
      location: 'Main Community Hall',
      description: 'Discussing new budget allocations and upcoming development projects for local wards.',
    },
    {
      id: 2,
      title: 'Cultural Festival 2024',
      date: 'Nov 5, 2024 10:00 AM',
      location: 'City Stadium',
      description: 'Annual cultural fest bringing together artists, food vendors, and performances from across the city.',
    },
    {
      id: 3,
      title: 'Youth Career Fair',
      date: 'Nov 12, 2024 9:00 AM',
      location: 'Parth Gautam Foundation Center',
      description: 'Connecting youth with local businesses, startups, and training institutes for employment opportunities.',
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="people" size={48} color="#fff" />
          <Text style={styles.headerTitle}>{t('community')}</Text>
          <Text style={styles.headerSubtitle}>{t('eventsAndVolunteer')}</Text>
        </View>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'volunteer' && styles.tabActive]}
          onPress={() => setActiveTab('volunteer')}
        >
          <Text style={[styles.tabText, activeTab === 'volunteer' && styles.tabTextActive]}>
            {t('volunteer')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.tabActive]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
            {t('events')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'volunteer' && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('volunteerOpportunities')}</Text>
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
                      {program.volunteers} {t('volunteersNeeded')}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => Alert.alert(t('successTitle'), t('joinedProgramSuccess'))}
                >
                  <Text style={styles.joinButtonText}>{t('join')}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {activeTab === 'events' && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('upcomingEvents')}</Text>
            {mockEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <TouchableOpacity style={styles.rsvpButton} onPress={() => Alert.alert(t('rsvpConfirmed'))}>
                    <Text style={styles.rsvpButtonText}>{t('rsvp')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.eventMetaContainer}>
                  <View style={styles.eventMeta}>
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={styles.eventMetaText}>{event.date}</Text>
                  </View>
                  <View style={styles.eventMeta}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={styles.eventMetaText}>{event.location}</Text>
                  </View>
                </View>
                <Text style={styles.eventDescription}>{event.description}</Text>
              </View>
            ))}
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
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
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
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  rsvpButton: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
  },
  rsvpButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  eventMetaContainer: {
    marginTop: 4,
    marginBottom: 12,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  eventDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
