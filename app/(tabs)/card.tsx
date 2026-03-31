import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { userAPI } from '../../utils/api';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';

export default function CitizenCardScreen() {
  const { user, logout, setUser } = useAuthStore();
  const { signOut } = useAuth();
  const { t } = useLanguageStore();
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadData();
      }
    }, [user?.id])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      // const freshUser = await userAPI.getById(user!.id);

      const mockHistory = [
        {
          id: 'a1',
          programs: { title: 'Mega Health Camp', category: 'Healthcare' },
          registered_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          status: 'Attended'
        },
        {
          id: 'a2',
          programs: { title: 'Digital Literacy Workshop', category: 'Education' },
          registered_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          status: 'Attended'
        },
        {
          id: 'a3',
          programs: { title: 'Community Cleanup Drive', category: 'Community' },
          registered_at: new Date(Date.now() - 86400000 * 10).toISOString(),
          status: 'Registered'
        }
      ];

      // setUser(freshUser);
      setActivities(mockHistory);
    } catch (error) {
      console.error('Error loading card data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert(t('logout'), 'Are you sure you want to logout?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{t('citizenCard')}</Text>
          <LanguageSwitcher />
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Digital Card */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB', '#1E40AF']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Parth Gautam Citizen Card</Text>
              <View style={styles.cardLogo}>
                <Ionicons name="shield-checkmark" size={32} color="#fff" />
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.citizenId}>ID: {user.citizen_id}</Text>
              <Text style={styles.wardInfo}>{t('ward')} {user.ward}</Text>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.footerLabel}>{t('memberSince')}</Text>
                <Text style={styles.footerValue}>{new Date().getFullYear()}</Text>
              </View>
              <View style={styles.qrContainer}>
                <QRCode value={user.citizen_id} size={60} backgroundColor="white" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('yourBenefits')}</Text>
          {[
            {
              icon: 'medical',
              title: t('priorityHealthRegistration'),
              description: t('skipQueues'),
              color: '#EF4444',
            },
            {
              icon: 'school',
              title: t('scholarshipEligibility'),
              description: t('accessEducation'),
              color: '#F59E0B',
            },
            {
              icon: 'book',
              title: t('skillCourseAccess'),
              description: t('freeTraining'),
              color: '#10B981',
            },
            {
              icon: 'ribbon',
              title: t('volunteerRecognition'),
              description: t('earnPointsRewards'),
              color: '#8B5CF6',
            },
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: benefit.color + '20' }]}>
                <Ionicons name={benefit.icon as any} size={24} color={benefit.color} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
          ))}
        </View>

        {/* Impact Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('citizenImpactScore')}</Text>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.impactCard}
          >
            <View style={styles.impactHeader}>
              <Ionicons name="trophy" size={48} color="#fff" />
              <View>
                <Text style={styles.impactLabel}>{t('yourImpact')}</Text>
                <Text style={styles.impactScore}>{user.volunteer_points} {t('points')}</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.programs_attended}</Text>
                <Text style={styles.statLabel}>{t('programsAttended')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.volunteer_points}</Text>
                <Text style={styles.statLabel}>{t('volunteerPoints')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user.community_reports}</Text>
                <Text style={styles.statLabel}>{t('issuesReported')}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.leaderboardButton}>
              <Ionicons name="podium" size={20} color="#F59E0B" />
              <Text style={styles.leaderboardText}>{t('viewLeaderboard')}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Survey Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.surveyActionButton}
            onPress={() => router.push('/survey' as any)}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.surveyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.surveyActionContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.surveyActionTitle}>{t('takeSurvey')}</Text>
                  <Text style={styles.surveyActionSubtitle}>{t('yourFeedbackMatters')}</Text>
                </View>
                <View style={styles.surveyIconCircle}>
                  <Ionicons name="clipboard" size={24} color="#8B5CF6" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Activity History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recentActivity')}</Text>
            {loading && <ActivityIndicator size="small" color="#3B82F6" />}
          </View>

          {activities.length > 0 ? (
            activities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIconBox, {
                  backgroundColor: activity.programs?.category === 'Healthcare' ? '#FEF2F2' :
                    activity.programs?.category === 'Education' ? '#FFFBEB' : '#F0FDF4'
                }]}>
                  <Ionicons
                    name={activity.programs?.category === 'Healthcare' ? 'medical' :
                      activity.programs?.category === 'Education' ? 'school' : 'people'}
                    size={20}
                    color={activity.programs?.category === 'Healthcare' ? '#EF4444' :
                      activity.programs?.category === 'Education' ? '#F59E0B' : '#10B981'}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.programs?.title || 'Program Participation'}</Text>
                  <Text style={styles.activityDate}>
                    {new Date(activity.registered_at).toLocaleDateString()} • {activity.status}
                  </Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>+5</Text>
                </View>
              </View>
            ))
          ) : !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>{t('noRecentActivity')}</Text>
              <Text style={styles.emptySubtext}>
                {t('startParticipating')}
              </Text>
            </View>
          )}
        </View>

        {/* My Issues Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('myIssues')}</Text>
          {[
            {
              id: 'i1',
              title: 'Street Light Not Working',
              status: 'Pending',
              comments: 'Our executive will visit your ward by tomorrow morning.',
              history: [
                { event: 'reported', date: '2024-03-20', time: '10:00 AM' },
                { event: 'forwarded', date: '2024-03-21', time: '02:30 PM' },
              ]
            },
            {
              id: 'i2',
              title: 'Garbage Collection Delayed',
              status: 'Resolved',
              comments: 'The area has been cleared. Thank you for reporting.',
              history: [
                { event: 'reported', date: '2024-03-18', time: '09:15 AM' },
                { event: 'forwarded', date: '2024-03-19', time: '11:45 AM' },
                { event: 'resolved', date: '2024-03-22', time: '04:20 PM' },
              ]
            },
          ].map((issue) => (
            <TouchableOpacity 
              key={issue.id} 
              style={styles.issueCard}
              onPress={() => setSelectedIssue(issue)}
              activeOpacity={0.7}
            >
              <View style={styles.issueHeader}>
                <Text style={styles.issueTitle}>{issue.title}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: issue.status === 'Resolved' ? '#DCFCE7' : '#FEF3C7' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: issue.status === 'Resolved' ? '#166534' : '#92400E' }
                  ]}>
                    {issue.status}
                  </Text>
                </View>
              </View>
              <View style={styles.commentBox}>
                <Text style={styles.commentLabel}>{t('comments')}:</Text>
                <Text style={styles.commentText}>{issue.comments}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Issue History Modal */}
      <Modal visible={!!selectedIssue} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('issueHistory')}</Text>
              <TouchableOpacity onPress={() => setSelectedIssue(null)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalIssueTitle}>{selectedIssue?.title}</Text>
              
              <View style={styles.timeline}>
                {selectedIssue?.history.map((h: any, idx: number) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot,
                        idx === 0 && styles.timelineDotActive
                      ]} />
                      {idx !== selectedIssue.history.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>
                    <View style={styles.timelineRight}>
                      <Text style={styles.timelineEvent}>{t(h.event as any)}</Text>
                      <Text style={styles.timelineDate}>
                        {h.date} {t('at')} {h.time}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.modalCommentSection}>
                <Text style={styles.commentLabel}>{t('comments')}</Text>
                <Text style={styles.modalCommentText}>{selectedIssue?.comments}</Text>
              </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  cardContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0F2FE',
    flex: 1,
  },
  cardLogo: {
    opacity: 0.9,
  },
  cardBody: {
    marginBottom: 24,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  citizenId: {
    fontSize: 18,
    color: '#E0F2FE',
    fontWeight: '600',
    marginBottom: 4,
  },
  wardInfo: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 12,
    color: '#BFDBFE',
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
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
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  impactCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  impactLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  impactScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
  },
  leaderboardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
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
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  pointsBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  issueCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  issueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  commentBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '60%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  modalContent: {
    paddingBottom: 40,
  },
  modalIssueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 24,
  },
  timeline: {
    paddingLeft: 8,
    marginBottom: 32,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: '#3B82F6',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: -2,
  },
  timelineRight: {
    flex: 1,
    paddingTop: -2,
  },
  timelineEvent: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalCommentSection: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
  },
  modalCommentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 8,
  },
  surveyActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  surveyGradient: {
    padding: 20,
  },
  surveyActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  surveyActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  surveyActionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  surveyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
});
