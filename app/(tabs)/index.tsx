import React, { useEffect, useState } from 'react';
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
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { suggestionsAPI, programsAPI } from '../../utils/api';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const [suggestions, setSuggestions] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const loadData = async () => {
    if (!user) return;

    try {
      const [suggestionsData, programsData] = await Promise.all([
        suggestionsAPI.getForUser(user.id),
        programsAPI.getAll(),
      ]);
      setSuggestions(suggestionsData);
      setUpdates(programsData.slice(0, 4)); // Show latest 6 programs as updates
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();

    // Set up polling for "realtime" updates - every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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
      onPress: () => router.push('/community'),
    },
    {
      id: 'course',
      title: t('joinSkillCourse'),
      icon: 'briefcase',
      color: '#10B981',
      onPress: () => router.push('/jobs' as any),
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
              <Text style={styles.userName}>{user.name}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.statusText}>{t('citizenMember')} • {t('ward')} {user.ward}</Text>
          </View>
        </LinearGradient>

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
            <TouchableOpacity onPress={() => router.push('/(tabs)/programs')}>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>

          {updates.length > 0 ? (
            updates.map((program: any) => (
              <TouchableOpacity
                key={program.id}
                style={styles.updateCard}
                onPress={() => router.push({
                  pathname: '/(tabs)/programs',
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
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
