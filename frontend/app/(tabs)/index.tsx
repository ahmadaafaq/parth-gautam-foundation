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
import { suggestionsAPI, updatesAPI } from '../../utils/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';

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
      const [suggestionsData, updatesData] = await Promise.all([
        suggestionsAPI.getForUser(user.id),
        updatesAPI.getAll(user.ward),
      ]);
      setSuggestions(suggestionsData);
      setUpdates(updatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
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
      icon: 'book',
      color: '#10B981',
      onPress: () => router.push('/education?type=skills' as any),
    },
  ];

  if (!user) return null;

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
              <LanguageSwitcher />
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
          <Text style={styles.sectionTitle}>{t('communityUpdates')}</Text>
          {updates.length > 0 ? (
            updates.map((update: any) => (
              <View key={update.id} style={styles.updateCard}>
                <View style={styles.updateIcon}>
                  <Ionicons
                    name={update.type === 'resolved_issue' ? 'checkmark-circle' : 'calendar'}
                    size={20}
                    color={update.type === 'resolved_issue' ? '#10B981' : '#3B82F6'}
                  />
                </View>
                <View style={styles.updateContent}>
                  <Text style={styles.updateTitle}>{update.title}</Text>
                  <Text style={styles.updateDate}>{update.date}</Text>
                </View>
              </View>
            ))
          ) : (
            <>
              <View style={styles.updateCard}>
                <View style={[styles.updateIcon, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="sparkles" size={20} color="#10B981" />
                </View>
                <View style={styles.updateContent}>
                  <Text style={styles.updateTitle}>Ward {user.ward} Digital Literacy Drive 🎉</Text>
                  <Text style={styles.updateDate}>Today • 10:30 AM</Text>
                </View>
                <View style={styles.updateBadge}>
                  <Text style={[styles.updateBadgeText, { color: '#10B981' }]}>SUCCESS</Text>
                </View>
              </View>

              <View style={styles.updateCard}>
                <View style={[styles.updateIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="megaphone" size={20} color="#3B82F6" />
                </View>
                <View style={styles.updateContent}>
                  <Text style={styles.updateTitle}>New Mobile Health Van Schedule Added</Text>
                  <Text style={styles.updateDate}>Yesterday • 2:15 PM</Text>
                </View>
                <View style={styles.updateBadge}>
                  <Text style={[styles.updateBadgeText, { color: '#3B82F6' }]}>NOTICE</Text>
                </View>
              </View>

              <View style={styles.updateCard}>
                <View style={[styles.updateIcon, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="construct" size={20} color="#F59E0B" />
                </View>
                <View style={styles.updateContent}>
                  <Text style={styles.updateTitle}>Community Hall Renovation Town Hall</Text>
                  <Text style={styles.updateDate}>Mar 10, 2026</Text>
                </View>
                <View style={styles.updateBadge}>
                  <Text style={[styles.updateBadgeText, { color: '#F59E0B' }]}>EVENT</Text>
                </View>
              </View>

              <View style={styles.updateCard}>
                <View style={[styles.updateIcon, { backgroundColor: '#FDF4FF' }]}>
                  <Ionicons name="trophy" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.updateContent}>
                  <Text style={styles.updateTitle}>10 Citizens Earned Volunteer Badges</Text>
                  <Text style={styles.updateDate}>Mar 9, 2026</Text>
                </View>
                <View style={styles.updateBadge}>
                  <Text style={[styles.updateBadgeText, { color: '#8B5CF6' }]}>AWARD</Text>
                </View>
              </View>
            </>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
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
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  updateDate: {
    fontSize: 12,
    color: '#6B7280',
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
