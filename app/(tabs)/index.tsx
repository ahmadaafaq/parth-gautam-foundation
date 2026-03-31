import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { suggestionsAPI, programsAPI } from '../../utils/api';
import bannerImage from '../../assets/images/parth-gautam-umesh-gautam.png';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const mockSuggestions = [
    { id: 's1', title: 'Free Medical Checkup', location: 'Ward 1 Health Center', date: 'Tomorrow, 10 AM', category: 'healthcare' },
    { id: 's2', title: 'IT Skills Training', location: 'Community Center', date: 'Next Monday', category: 'education' },
  ];

  const mockUpdates = [
    { id: 'u1', title: 'New Scholarship Program Announced', location: 'All Wards', date: 'Today', category: 'education' },
    { id: 'u2', title: 'Mega Health Camp', location: 'Govt School, Ward 4', date: '15th Oct', category: 'healthcare' },
    { id: 'u3', title: 'Job Fair 2024', location: 'City Square', date: '20th Oct', category: 'jobs' },
    { id: 'u4', title: 'Women Empowerment Drive', location: 'Community Hall', date: '25th Oct', category: 'community' },
  ];

  const [suggestions, setSuggestions] = useState<any[]>(mockSuggestions);
  const [updates, setUpdates] = useState<any[]>(mockUpdates);
  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  useEffect(() => {
    // Mock data does not need loading logic or interval
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const quickActions = [
    {
      id: 'doctor',
      title: t('bookDoctor'),
      icon: 'medical',
      color: '#EF4444',
      onPress: () => router.push('/healthcare'),
    },
    {
      id: 'scholarship',
      title: t('applyScholarship'),
      icon: 'school',
      color: '#F59E0B',
      onPress: () => router.push('/education?type=scholarship' as any),
    },
    {
      id: 'issue',
      title: t('reportIssue'),
      icon: 'alert-circle',
      color: '#8B5CF6',
      onPress: () => router.push('/report-issue' as any),
    },
    {
      id: 'course',
      title: t('joinSkillCourse'),
      icon: 'briefcase',
      color: '#10B981',
      onPress: () => router.push('/jobs' as any),
    },
    {
      id: 'voter',
      title: (t as any)('smartVoter') || 'Smart Voter',
      icon: 'checkbox',
      color: '#3B82F6',
      onPress: () => router.push('/voter' as any),
    },
    {
      id: 'call',
      title: (t as any)('weeklyCall') || 'Weekly Call',
      icon: 'call',
      color: '#10B981',
      onPress: () => router.push('/weekly-call' as any),
    },
  ];

  if (!user) return <View style={styles.container} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >


        {/* Header */}
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
          <View style={styles.greetingRow}>
            <View style={styles.greetingContent}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
            </View>
            <View style={styles.headerActions}>
              <LanguageSwitcher variant="light" />
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        <Image
          source={bannerImage}
          style={styles.mainBanner}
          resizeMode="cover"
        />

        {/* Citizen Card Mini Widget */}
        <View style={styles.cardWidget}>
          <View style={styles.cardWidgetContent}>
            <View>
              <Text style={styles.cardWidgetLabel}>{t('citizenId')}</Text>
              <Text style={styles.cardWidgetId}>{user.citizen_id}</Text>
              <Text style={styles.cardWidgetMember}>
                {t('memberSince')} {new Date().getFullYear()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewCardButton}
              onPress={() => router.push('/(tabs)/card')}
            >
              <Text style={styles.viewCardButtonText}>{t('viewCard')}</Text>
              <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.onPress}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('recommendedForYou')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsScrollContent}
            >
              {suggestions.map((program: any) => (
                <TouchableOpacity key={program.id} style={styles.suggestionCard}>
                  <View style={styles.suggestionHeader}>
                    <Ionicons
                      name={
                        program.category === 'healthcare'
                          ? 'medical'
                          : program.category === 'education'
                            ? 'school'
                            : 'people'
                      }
                      size={24}
                      color="#3B82F6"
                    />
                  </View>
                  <Text style={styles.suggestionTitle} numberOfLines={2}>
                    {program.title}
                  </Text>
                  <Text style={styles.suggestionLocation} numberOfLines={1}>
                    <Ionicons name="location" size={12} color="#6B7280" /> {program.location}
                  </Text>
                  {program.date && (
                    <Text style={styles.suggestionDate}>{program.date}</Text>
                  )}
                  <TouchableOpacity style={styles.registerButton}>
                    <Text style={styles.registerButtonText}>{t('registerNow')}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Community Updates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('communityUpdates')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)')}>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>

          {updates.length > 0 ? (
            updates.map((program: any) => (
              <TouchableOpacity
                key={program.id}
                style={styles.updateCard}
                onPress={() => router.push({
                  pathname: '/(tabs)',
                  params: { highlighted: program.id }
                } as any)}
              >
                <View style={[
                  styles.updateIcon,
                  {
                    backgroundColor:
                      program.category === 'healthcare' ? '#FEE2E2' :
                        program.category === 'education' ? '#FEF3C7' : '#EDE9FE'
                  }
                ]}>
                  <Ionicons
                    name={
                      program.category === 'healthcare' ? 'medical' :
                        program.category === 'education' ? 'school' : 'people'
                    }
                    size={20}
                    color={
                      program.category === 'healthcare' ? '#EF4444' :
                        program.category === 'education' ? '#F59E0B' : '#8B5CF6'
                    }
                  />
                </View>
                <View style={styles.updateContent}>
                  <View style={styles.updateTitleRow}>
                    <Text style={styles.updateTitle} numberOfLines={1}>{program.title}</Text>
                    <View style={[
                      styles.categoryBadge,
                      {
                        backgroundColor:
                          program.category === 'healthcare' ? '#FEE2E2' :
                            program.category === 'education' ? '#FEF3C7' : '#EDE9FE'
                      }
                    ]}>
                      <Text style={[
                        styles.categoryBadgeText,
                        {
                          color:
                            program.category === 'healthcare' ? '#EF4444' :
                              program.category === 'education' ? '#F59E0B' : '#8B5CF6'
                        }
                      ]}>
                        {program.category?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.updateInfoRow}>
                    <Text style={styles.updateDate}>
                      <Ionicons name="calendar-outline" size={12} /> {program.date || t('soon')}
                    </Text>
                    <Text style={styles.updateLocation} numberOfLines={1}>
                      <Ionicons name="location-outline" size={12} /> {program.location}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>{t('noRecentUpdates')}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 2,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greetingContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#E0F2FE',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBanner: {
    width: '100%',
    height: 210,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardWidget: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardWidgetContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardWidgetLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardWidgetId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardWidgetMember: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewCardButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
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
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  suggestionsScrollContent: {
    paddingRight: 16,
    paddingBottom: 12, // Room for shadow
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionHeader: {
    width: 48,
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  suggestionLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  suggestionDate: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  updateCard: {
    flexDirection: 'row',
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
  updateIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  updateContent: {
    flex: 1,
    justifyContent: 'center',
  },
  updateTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  updateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  updateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  updateDate: {
    fontSize: 12,
    color: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateLocation: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  updateBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'center',
  },
  updateBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    padding: 24,
  },
});
