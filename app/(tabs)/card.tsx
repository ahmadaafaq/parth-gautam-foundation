import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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

export default function CitizenCardScreen() {
  const { user, logout, setUser } = useAuthStore();
  const { t } = useLanguageStore();
  const router = useRouter();

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [freshUser, history] = await Promise.all([
        userAPI.getById(user!.id),
        userAPI.getActivity(user!.id),
      ]);
      setUser(freshUser);
      setActivities(history);
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
});
